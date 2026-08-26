'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFaceDetection } from './FaceDetection';
import { Camera, XCircle, RefreshCcw, Loader2, CheckCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const { isModelLoaded, liveness, startDetection, stopDetection, resetLiveness, validateSingleFrame } = useFaceDetection();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError('');
      setCountdown(null);
      resetLiveness();
    } catch (err: any) {
      setCameraError('Camera access is required. Please allow camera permission in your browser.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    stopDetection();
  }, [stream, stopDetection]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVideoPlay = () => {
    if (videoRef.current) {
      startDetection(videoRef.current);
    }
  };

  // Automatic capture upon Liveness Passed with Countdown
  useEffect(() => {
    if (liveness.state === 'LIVENESS_PASSED' && !isCapturing && countdown === null) {
      setCountdown(3);
    }
  }, [liveness.state, isCapturing, countdown]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isCapturing) {
      takeAndValidatePhoto();
    }
  }, [countdown, isCapturing]);

  const takeAndValidatePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);
    setCountdown(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(
        async (blob) => {
          if (blob) {
            // Final face validation on the captured image
            const img = new Image();
            const url = URL.createObjectURL(blob);
            img.src = url;
            
            img.onload = async () => {
               const isValid = await validateSingleFrame(img);
               URL.revokeObjectURL(url);
               
               if (isValid) {
                  stopCamera();
                  onCapture(blob);
               } else {
                  // This shouldn't happen usually, but if they swapped the camera at the exact MS
                  alert("Final verification failed. Exactly one face must be visible.");
                  setIsCapturing(false);
                  setCountdown(null);
                  resetLiveness();
               }
            };
          } else {
             setIsCapturing(false);
             setCountdown(null);
             resetLiveness();
          }
        },
        'image/jpeg',
        0.8
      );
    }
  };

  const getStatusBannerColor = () => {
     if (liveness.state === 'ERROR' || liveness.state === 'LIVENESS_FAILED') return 'bg-red-500/90';
     if (liveness.state === 'LIVENESS_PASSED') return 'bg-green-500/90';
     if (liveness.state.includes('CHALLENGE')) return 'bg-blue-500/90';
     return 'bg-black/60';
  };

  return (
    <div className="flex flex-col items-center bg-black/5 p-4 rounded-xl border border-gray-200">
      
      {cameraError ? (
        <div className="text-center p-6 bg-red-50 text-red-700 rounded-lg max-w-sm">
          <XCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
          <p className="font-medium">{cameraError}</p>
          <button 
            onClick={startCamera}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-4">
          
          {/* Viewfinder */}
          <div className="relative aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onPlay={handleVideoPlay}
              className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${isCapturing ? 'opacity-50' : 'opacity-100'}`}
            />
            
            {/* Face Guide Overlay */}
            <div className="absolute inset-0 border-[3px] border-white/30 rounded-2xl pointer-events-none m-8" />
            
            {/* Status Overlay */}
            <div className="absolute top-4 inset-x-0 flex justify-center px-4 text-center">
              <div className={`px-4 py-2 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2 backdrop-blur-md text-white transition-colors duration-300 ${countdown !== null && countdown > 0 ? 'bg-indigo-600/90 text-lg scale-110 shadow-indigo-500/50' : getStatusBannerColor()}`}>
                {countdown !== null && countdown > 0 ? (
                  <span>📸 Look directly at the camera! ({countdown})</span>
                ) : (
                  <>
                    {!isModelLoaded || isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isCapturing ? 'Capturing & Validating Photo...' : liveness.message}
                  </>
                )}
              </div>
            </div>

            {/* Challenge Progress Indicators */}
            {(liveness.state.includes('CHALLENGE') || liveness.state === 'LIVENESS_PASSED') && !isCapturing && countdown === null && (
              <div className="absolute bottom-6 inset-x-0 flex flex-col items-center gap-2 bg-black/40 backdrop-blur-sm mx-8 py-3 rounded-xl border border-white/20">
                <div className="flex items-center gap-2 text-white text-sm font-medium">
                  {liveness.state === 'CHALLENGE_1' ? (
                     <span className="text-yellow-400 flex items-center gap-1">● Challenge 1</span>
                  ) : (
                     <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Challenge 1</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-white text-sm font-medium">
                  {liveness.state === 'LIVENESS_PASSED' ? (
                     <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Challenge 2</span>
                  ) : liveness.state === 'CHALLENGE_2' ? (
                     <span className="text-yellow-400 flex items-center gap-1">● Challenge 2</span>
                  ) : (
                     <span className="text-gray-400 flex items-center gap-1">○ Challenge 2</span>
                  )}
                </div>
              </div>
            )}
            
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Controls */}
          <div className="flex gap-3 pt-2">
             <button
               type="button"
               onClick={onCancel}
               className="flex-1 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
             >
               Cancel
             </button>
             
             {liveness.state === 'LIVENESS_FAILED' && (
               <button
                 type="button"
                 onClick={startCamera} // Restarts everything
                 className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-md"
               >
                 Restart Camera
               </button>
             )}
          </div>
          
        </div>
      )}
    </div>
  );
}
