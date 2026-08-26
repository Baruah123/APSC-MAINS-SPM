'use client';

import React from 'react';
import { useWizard } from './WizardContext';
import MobileStep from './MobileStep';
import RollNumberStep from './RollNumberStep';
import PhotoStep from './PhotoStep';
import EmailStep from './EmailStep';
import TestModeStep from './TestModeStep';
import ReviewStep from './ReviewStep';
import { CheckCircle2 } from 'lucide-react';

const steps = [
  { id: 1, title: 'Mobile' },
  { id: 2, title: 'Roll Number' },
  { id: 3, title: 'Photo' },
  { id: 4, title: 'Email' },
  { id: 5, title: 'Test Mode' },
  { id: 6, title: 'Confirm' },
];

export default function RegistrationWizard() {
  const { state } = useWizard();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-center mb-8">
        <img 
          src="/logo.webp" 
          alt="SPM IAS Academy Logo" 
          width="180" 
          height="60" 
          className="object-contain"
        />
      </div>
      
      <div className="mb-14 px-2">
        <div className="relative flex justify-between items-center">
          {/* Background Line */}
          <div className="absolute left-0 top-4 -translate-y-1/2 w-full h-1 bg-gray-100 rounded"></div>
          
          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${state.currentStep === step.id ? 'bg-[#1a56db] text-white ring-4 ring-[#edf2fa] shadow-sm' : 
                    state.currentStep > step.id ? 'bg-[#1a56db] text-white shadow-sm' : 'bg-white text-gray-400 border-2 border-gray-100'}`}
              >
                {state.currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
              </div>
              <span className={`text-xs mt-3 hidden sm:block font-medium absolute top-8 whitespace-nowrap transition-colors
                  ${state.currentStep === step.id ? 'text-blue-700' : 
                    state.currentStep > step.id ? 'text-green-600' : 'text-gray-400'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {state.currentStep === 1 && <MobileStep />}
        {state.currentStep === 2 && <RollNumberStep />}
        {state.currentStep === 3 && <PhotoStep />}
        {state.currentStep === 4 && <EmailStep />}
        {state.currentStep === 5 && <TestModeStep />}
        {state.currentStep === 6 && <ReviewStep />}
      </div>
    </div>
  );
}
