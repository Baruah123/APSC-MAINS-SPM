'use client';

import React, { useState, useEffect } from 'react';
import { useWizard } from './WizardContext';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mobileSchema, otpSchema } from '@/lib/validation/schemas';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase/client';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

declare global {
  interface Window {
    recaptchaVerifier: any;
    grecaptcha: any;
  }
}

type MobileFormValues = z.infer<typeof mobileSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

export default function MobileStep() {
  const { state, updateState, nextStep } = useWizard();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);

  const mobileForm = useRHForm<MobileFormValues>({
    resolver: zodResolver(mobileSchema),
    defaultValues: { mobile: state.mobile },
  });

  const otpForm = useRHForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { mobile: state.mobile, otp: '' },
  });

  useEffect(() => {
    // Initialize Firebase Recaptcha as a VISIBLE widget.
    // This completely eliminates the invisible lifecycle bugs and "u is null" errors.
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'normal',
          callback: (response: any) => {
            // reCAPTCHA solved
            console.log("Recaptcha solved!");
            setIsRecaptchaVerified(true);
          },
          'expired-callback': () => {
            console.log("Recaptcha expired.");
            setIsRecaptchaVerified(false);
            if (window.grecaptcha && window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
          }
        });
        
        window.recaptchaVerifier.render();
      } catch (e) {
        console.error("Recaptcha init error:", e);
      }
    }

    return () => {
      // Clean up on unmount for React Strict Mode
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch(e) {}
      }
    };
  }, []);

  const onSendOtp = async (data: MobileFormValues) => {
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Check if number is already registered in our database
      const checkRes = await fetch('/api/registration/check-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: data.mobile }),
      });
      const checkResult = await checkRes.json();
      
      if (!checkRes.ok) {
        setErrorMsg(checkResult.error || 'Failed to verify mobile number.');
        setLoading(false);
        return;
      }
      
      if (checkResult.exists) {
        setErrorMsg('This mobile number has already been used to register.');
        setLoading(false);
        return;
      }

      // 2. Trigger Firebase OTP
      const phoneNumber = `+91${data.mobile}`;
      if (!window.recaptchaVerifier) {
         throw new Error("Recaptcha is not initialized. Please refresh the page.");
      }
      
      console.log("Firebase App Config:", auth.app.options);
      
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      
      setConfirmationResult(result);
      updateState({ mobile: data.mobile });
      otpForm.setValue('mobile', data.mobile);
      setIsOtpSent(true);
    } catch (error: any) {
      console.error("Firebase sendOtp error:", error);
      
      if (error.code === 'auth/too-many-requests' || error.message?.includes('too-many-requests')) {
        setErrorMsg('You have requested an OTP too many times. Please try again later.');
      } else if (error.code === 'auth/invalid-app-credential' || error.message?.includes('invalid-app-credential')) {
        setErrorMsg('Security verification failed. Please refresh the page and try again.');
      } else {
        setErrorMsg('Failed to send OTP. Please try again.');
      }
      
      // Reset recaptcha on error so they can try again
      if (window.recaptchaVerifier) {
         try {
           window.recaptchaVerifier.clear();
           window.recaptchaVerifier = null;
           setIsRecaptchaVerified(false);
           // Re-initialize
           window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
              size: 'normal'
           });
           window.recaptchaVerifier.render();
         } catch(e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (data: OtpFormValues) => {
    setLoading(true);
    setErrorMsg('');
    
    try {
      if (!confirmationResult) {
         throw new Error("OTP session expired. Please resend.");
      }

      // Verify OTP with Firebase
      await confirmationResult.confirm(data.otp);

      // OTP Verified Successfully! Now establish our secure backend session
      const res = await fetch('/api/registration/otp/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: data.mobile }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to establish secure session');
      
      updateState({ isMobileVerified: true });
      nextStep();
    } catch (err: any) {
      console.error("Firebase verifyOtp error:", err);
      setErrorMsg('Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <h2 className="text-[26px] font-bold text-[#0f1419] tracking-tight mb-8">Mobile Verification</h2>
      
      {errorMsg && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      {!isOtpSent ? (
        <form onSubmit={mobileForm.handleSubmit(onSendOtp)} className="space-y-4">
          <div>
            <label className="block text-[15px] font-medium text-[#0f1419] mb-2">Enter Your Mobile Number</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+91</span>
              <input
                {...mobileForm.register('mobile')}
                type="tel"
                maxLength={10}
                className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db] transition-shadow outline-none text-base"
                placeholder="10-digit mobile number"
              />
            </div>
            {mobileForm.formState.errors.mobile && (
              <p className="mt-1 text-sm text-red-600">{mobileForm.formState.errors.mobile.message}</p>
            )}
          </div>
          
          <div id="recaptcha-container" className="flex justify-center mt-4 mb-4 w-full"></div>
          
          <button
            type="submit"
            disabled={loading || !isRecaptchaVerified}
            className={`w-full text-white font-medium py-3.5 px-4 rounded-lg focus:ring-4 focus:ring-[#edf2fa] transition-colors flex justify-center items-center text-[15px] tracking-wide ${
              loading || !isRecaptchaVerified 
                ? 'bg-blue-400 cursor-not-allowed opacity-70' 
                : 'bg-[#1a56db] hover:bg-[#1546b5]'
            }`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
            <p className="text-sm text-gray-500 mb-3">Sent via SMS to +91 {state.mobile}</p>
            <input
              {...otpForm.register('otp')}
              type="text"
              maxLength={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none tracking-widest text-center text-lg"
              placeholder="000000"
            />
            {otpForm.formState.errors.otp && (
              <p className="mt-1 text-sm text-red-600">{otpForm.formState.errors.otp.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-100 transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
          </button>

          <button
            type="button"
            onClick={() => setIsOtpSent(false)}
            className="w-full text-blue-600 font-medium py-3 px-4 text-sm hover:underline"
          >
            Change Mobile Number
          </button>
        </form>
      )}
    </div>
  );
}
