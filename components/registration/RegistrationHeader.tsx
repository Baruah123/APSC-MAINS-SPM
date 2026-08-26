'use client';

import React from 'react';
import { useWizard } from './WizardContext';

export default function RegistrationHeader() {
  const { state } = useWizard();

  // Hide the header cards completely if we are past the first step
  if (state.currentStep > 1) {
    return null;
  }

  return (
    <>
      {/* Top Header Card */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="bg-[#FFCC00] py-3 flex justify-center items-center">
          <img 
            src="/logo.webp" 
            alt="SPM IAS Academy Logo" 
            width="200" 
            height="60" 
            className="object-contain"
          />
        </div>
        <div className="p-5 md:p-6 text-left border-t-8 border-blue-600">
          <h2 className="text-2xl md:text-3xl font-normal text-gray-900 mb-4">
            APSC CCE'25 All Assam Open Mains Mock Test - Offline Registration
          </h2>
          
          <div className="text-gray-800 text-sm md:text-base">
            <h3 className="font-bold text-gray-900 mb-2">What's This Mock Test All About? Let's Break It Down!</h3>
            <p className="mb-4">
              The All Assam APSC Mains Mock Test, organized by SPM IAS Academy – one of the top coaching institutes for civil services in Assam – is a free online & Offline test specially crafted for aspirants preparing for the upcoming APSC Mains.
            </p>
            
            <ul className="space-y-1">
              <li><span className="font-bold text-gray-900">Mode:</span> Online & Offline</li>
              <li><span className="font-bold text-gray-900">Language:</span> Both in English and Assamese</li>
              <li><span className="font-bold text-gray-900">Eligibility:</span> Open to all APSC aspirants appearing for APSC CCE'25 Mains – No fees required</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Schedule Table Card */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden p-5 md:p-6 mb-4 animate-in fade-in slide-in-from-top-6 duration-700">
        <h3 className="text-gray-900 text-base md:text-lg mb-4">All Assam Open Mains Mock Test Schedule.</h3>
        <div className="rounded-md border border-[#8ea9db] overflow-hidden">
          <img 
            src="/unnamed.jpeg" 
            alt="All Assam Open Mains Mock Test Schedule" 
            width="1200" 
            height="600" 
            className="w-full h-auto block"
          />
        </div>
      </div>
    </>
  );
}
