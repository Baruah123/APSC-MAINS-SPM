import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver, FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export type LivenessState = 
  | 'IDLE'
  | 'FACE_STABLE'
  | 'CHALLENGE_1'
  | 'CHALLENGE_1_PASSED'
  | 'CHALLENGE_2'
  | 'LIVENESS_PASSED'
  | 'LIVENESS_FAILED'
  | 'FACE_LOST'
  | 'ERROR';

export type ChallengeType = 'TURN_LEFT' | 'TURN_RIGHT';

export type LivenessResult = {
  state: LivenessState;
  message: string;
  challenge1?: ChallengeType;
  challenge2?: ChallengeType;
  attemptsLeft: number;
};

const CHALLENGE_TIMEOUT_MS = 10000;
const FACE_LOST_TIMEOUT_MS = 3000;
const MAX_ATTEMPTS = 3;

export function useFaceDetection() {
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [liveness, setLiveness] = useState<LivenessResult>({
    state: 'IDLE',
    message: 'Initializing...',
    attemptsLeft: MAX_ATTEMPTS,
  });

  const requestRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  
  // State machine refs to avoid dependency cycles in requestAnimationFrame
  const stateRef = useRef<LivenessState>('IDLE');
  const attemptsRef = useRef<number>(MAX_ATTEMPTS);
  const challengesRef = useRef<{c1?: ChallengeType, c2?: ChallengeType}>({});
  const isActiveRef = useRef<boolean>(true);
  
  const challengeStartTimeRef = useRef<number>(0);
  const faceLostTimeRef = useRef<number>(0);
  const baselineNosePosRef = useRef<number>(0.5);
  const blinkStateRef = useRef<'OPEN' | 'CLOSED'>('OPEN');
  
  // Update React state safely from animation loop
  const updateLiveness = (newState: LivenessState, msg: string) => {
    if (stateRef.current !== newState || liveness.message !== msg) {
      stateRef.current = newState;
      setLiveness({
        state: newState,
        message: msg,
        challenge1: challengesRef.current.c1,
        challenge2: challengesRef.current.c2,
        attemptsLeft: attemptsRef.current
      });
    }
  };

  // Initialize MediaPipe Face Landmarker
  useEffect(() => {
    let active = true;

    async function initModel() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm"
        );
        
        if (!active) return;

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
        });

        if (!active) return;
        
        setLandmarker(faceLandmarker);
        setIsModelLoaded(true);
        updateLiveness('IDLE', 'Ready. Please position your face in the frame.');
      } catch (error) {
        console.error("Failed to initialize FaceLandmarker:", error);
        updateLiveness('ERROR', 'Camera verification isn\'t working properly. Please check permissions.');
      }
    }

    initModel();

    return () => {
      active = false;
      isActiveRef.current = false;
      if (landmarker) {
        try { landmarker.close(); } catch(e) {}
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startNewAttempt = useCallback(() => {
    if (attemptsRef.current <= 0) return false;
    
    attemptsRef.current -= 1;
    
    // Pick 2 random unique challenges (Blink removed due to unreliability)
    const pool: ChallengeType[] = ['TURN_LEFT', 'TURN_RIGHT'];
    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    
    challengesRef.current = { c1: pool[0], c2: pool[1] };
    
    blinkStateRef.current = 'OPEN';
    updateLiveness('FACE_STABLE', 'Hold still, calibrating...');
    
    setTimeout(() => {
       if (stateRef.current === 'FACE_STABLE') {
           challengeStartTimeRef.current = performance.now();
           updateLiveness('CHALLENGE_1', getChallengeMessage(challengesRef.current.c1!));
       }
    }, 1500); // 1.5 seconds calibration
    
    return true;
  }, []);

  const getChallengeMessage = (c: ChallengeType) => {
    if (c === 'TURN_LEFT') return '🟡 Please turn your head slightly LEFT';
    if (c === 'TURN_RIGHT') return '🟡 Please turn your head slightly RIGHT';
    return '';
  };

  const startDetection = useCallback((videoElement: HTMLVideoElement) => {
    if (!landmarker || !isModelLoaded) return;
    isActiveRef.current = true;

    const detectFrame = async () => {
      if (!isActiveRef.current) return;

      if (videoElement.readyState >= 2 && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        const now = performance.now();
        if (lastVideoTimeRef.current !== videoElement.currentTime) {
          lastVideoTimeRef.current = videoElement.currentTime;
          try {
            // Check if landmarker is closed before calling to avoid fatal WASM aborts
            if (!isActiveRef.current) return;
            const results = landmarker.detectForVideo(videoElement, now);
            const numFaces = results.faceLandmarks.length;
            const currentState = stateRef.current;

            // Handle terminal states
            if (currentState === 'LIVENESS_PASSED' || currentState === 'LIVENESS_FAILED' || currentState === 'ERROR') {
               requestRef.current = requestAnimationFrame(detectFrame);
               return;
            }

            // Detect Face Loss
            if (numFaces !== 1) {
              if (currentState !== 'IDLE' && currentState !== 'FACE_LOST') {
                 // We lost the face during a challenge
                 faceLostTimeRef.current = now;
                 updateLiveness('FACE_LOST', 'Face lost. Please return to the frame.');
              } else if (currentState === 'FACE_LOST') {
                 if (now - faceLostTimeRef.current > FACE_LOST_TIMEOUT_MS) {
                     // Too long out of frame
                     if (attemptsRef.current > 0) {
                        updateLiveness('LIVENESS_FAILED', 'Face lost for too long. Restarting attempt...');
                        setTimeout(() => updateLiveness('IDLE', 'Please position your face.'), 2000);
                     } else {
                        updateLiveness('LIVENESS_FAILED', 'We couldn\'t verify the movement. Please restart the camera and try again.');
                     }
                 }
              }
              requestRef.current = requestAnimationFrame(detectFrame);
              return;
            }

            // Face is present
            if (currentState === 'FACE_LOST') {
               // Recovered from face lost! Restart the current challenge timer
               challengeStartTimeRef.current = now;
               // Revert state to the active challenge
               if (challengesRef.current.c1 && challengesRef.current.c2) {
                   // We don't know exactly which challenge we were on without adding more refs, 
                   // but we can just force a restart of the attempt to be safe and simple.
                   updateLiveness('IDLE', 'Face detected. Restarting challenge...');
               }
            }

            const landmarks = results.faceLandmarks[0];
            const blendshapes = results.faceBlendshapes[0]?.categories;
            
            // Extract pose heuristic (Nose relative to eyes)
            const nose = landmarks[1];
            const leftEye = landmarks[33]; // User's right eye in mirrored video
            const rightEye = landmarks[263]; // User's left eye in mirrored video
            const eyeDist = rightEye.x - leftEye.x;
            const nosePos = (nose.x - leftEye.x) / eyeDist; 

            // State Machine Logic
            if (currentState === 'IDLE') {
               startNewAttempt();
            } 
            else if (currentState === 'FACE_STABLE') {
               // Continuously update baseline while stable
               baselineNosePosRef.current = nosePos;
            }
            else if (currentState === 'CHALLENGE_1' || currentState === 'CHALLENGE_2') {
               // Check timeout
               if (now - challengeStartTimeRef.current > CHALLENGE_TIMEOUT_MS) {
                   if (attemptsRef.current > 0) {
                      updateLiveness('LIVENESS_FAILED', 'Challenge timed out. Restarting attempt...');
                      setTimeout(() => updateLiveness('IDLE', 'Please position your face.'), 2000);
                   } else {
                      updateLiveness('LIVENESS_FAILED', 'We couldn\'t verify the movement. Please restart the camera and try again.');
                   }
                   requestRef.current = requestAnimationFrame(detectFrame);
                   return;
               }

               const activeChallenge = currentState === 'CHALLENGE_1' ? challengesRef.current.c1 : challengesRef.current.c2;
               let passed = false;

               if (activeChallenge === 'TURN_LEFT') {
                   // Nose moves to the left (decreases)
                   if (nosePos < baselineNosePosRef.current - 0.15) passed = true;
               }
               else if (activeChallenge === 'TURN_RIGHT') {
                   // Nose moves to the right (increases)
                   if (nosePos > baselineNosePosRef.current + 0.15) passed = true;
               }

               if (passed) {
                   if (currentState === 'CHALLENGE_1') {
                       updateLiveness('CHALLENGE_1_PASSED', '🟢 Challenge 1 verified');
                       setTimeout(() => {
                           blinkStateRef.current = 'OPEN';
                           challengeStartTimeRef.current = performance.now();
                           updateLiveness('CHALLENGE_2', getChallengeMessage(challengesRef.current.c2!));
                       }, 1000);
                   } else {
                       updateLiveness('LIVENESS_PASSED', '🟢 Liveness verified! Capturing...');
                   }
               }
            }
          } catch(e) {
             console.error("Detection error:", e);
          }
        }
      }
      
      requestRef.current = requestAnimationFrame(detectFrame);
    };

    detectFrame();
  }, [landmarker, isModelLoaded, startNewAttempt]);

  const stopDetection = useCallback(() => {
    isActiveRef.current = false;
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  }, []);

  const resetLiveness = useCallback(() => {
    attemptsRef.current = MAX_ATTEMPTS;
    updateLiveness('IDLE', 'Ready. Please position your face.');
  }, []);

  // One-off function for final face validation on the captured image
  const validateSingleFrame = async (imageElement: HTMLImageElement): Promise<boolean> => {
    if (!landmarker) return false;
    try {
       // Because the landmarker is initialized in VIDEO mode, we must use detectForVideo 
       // and pass the current timestamp, even when validating a static image frame.
       const results = landmarker.detectForVideo(imageElement, performance.now());
       return results.faceLandmarks.length === 1;
    } catch (e) {
       console.error("Final validation error:", e);
       return false;
    }
  };

  return { 
    isModelLoaded, 
    liveness, 
    startDetection, 
    stopDetection,
    resetLiveness,
    validateSingleFrame
  };
}
