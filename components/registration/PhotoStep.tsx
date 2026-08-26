'use client';

import React, { useState } from 'react';
import { useWizard } from './WizardContext';
import CameraCapture from '../camera/CameraCapture';
import { Camera, CheckCircle, Upload } from 'lucide-react';

export default function PhotoStep() {
  const { state, updateState, nextStep, prevStep } = useWizard();
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('File size must be less than 5MB');
        return;
      }
      handleCapture(file);
    }
  };

  const handleCapture = async (blob: Blob) => {
    setLoading(true);
    setErrorMsg('');
    setShowCamera(false);
    
    try {
      const formData = new FormData();
      formData.append('photo', blob, 'capture.jpg');
      
      const res = await fetch('/api/registration/upload-photo', {
        method: 'POST',
        body: formData,
      });
      
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Failed to upload photo');
      
      // Generate a local base64 preview for instant rendering on the Review step
      const reader = new FileReader();
      reader.onloadend = () => {
        updateState({ 
          photoPath: result.path,
          photoPreview: reader.result as string 
        });
      };
      reader.readAsDataURL(blob);

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Candidate Photo</h2>
      
      {errorMsg && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      {!state.photoPath ? (
        showCamera ? (
          <CameraCapture 
            onCapture={handleCapture} 
            onCancel={() => setShowCamera(false)} 
          />
        ) : (
          <div className="space-y-6">
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Capture your photo</h3>
              <p className="text-sm text-gray-500 max-w-sm mb-6">
                Please make sure you are in a well-lit area. Look directly at the camera and ensure no one else is in the frame.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mt-2">
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Camera className="w-5 h-5" /> Open Camera
                </button>
                <div className="text-gray-400 font-medium uppercase text-xs">or</div>
                <label className={`w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2 ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                  <Upload className="w-5 h-5 text-gray-500" /> Upload Image
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                disabled={true}
                className="flex-1 bg-gray-200 text-gray-500 font-medium py-3 px-4 rounded-lg cursor-not-allowed"
              >
                Continue to Email
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="space-y-6">
           <div className="p-5 bg-green-50 border border-green-200 rounded-xl flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-4">
                {state.photoPreview ? (
                  <img src={state.photoPreview} alt="Captured" className="w-16 h-16 object-cover rounded-lg border border-green-200 shadow-sm" />
                ) : (
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Photo Saved Successfully</h3>
                  <p className="text-sm text-green-800 mt-1">Your photo looks great!</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateState({ photoPath: undefined, photoPreview: undefined });
                  setShowCamera(true);
                }}
                className="px-4 py-2 bg-white border border-green-300 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors whitespace-nowrap shadow-sm"
              >
                Retake Photo
              </button>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={nextStep}
              disabled={!state.photoPath}
              className="w-full sm:flex-1 bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
