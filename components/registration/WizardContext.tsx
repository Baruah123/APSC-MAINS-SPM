'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type WizardState = {
  currentStep: number;
  mobile: string;
  isMobileVerified: boolean;
  rollNumber: string;
  candidateName: string;
  photoPath: string;
  photoPreview?: string;
  email: string;
  mockTestMode: 'online' | 'offline' | '';
  preferredLocation: string;
  secondPreferredLocation: string;
  courseEnrolledIn: string;
  otherCourseDetails: string;
  yearOfEnrollment: string;
  monthOfEnrollment: string;
  batchTiming: string;
  acceptance: boolean;
};

type WizardContextType = {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
};

const initialState: WizardState = {
  currentStep: 1,
  mobile: '',
  isMobileVerified: false,
  rollNumber: '',
  candidateName: '',
  photoPath: '',
  email: '',
  mockTestMode: '',
  preferredLocation: '',
  secondPreferredLocation: '',
  courseEnrolledIn: '',
  otherCourseDetails: '',
  yearOfEnrollment: '',
  monthOfEnrollment: '',
  batchTiming: '',
  acceptance: false,
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(initialState);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('registration_wizard_state');
    if (saved) {
      try { setState(JSON.parse(saved)); } catch (e) {}
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      sessionStorage.setItem('registration_wizard_state', JSON.stringify(state));
    }
  }, [state, isMounted]);

  // Prevent rendering children until hydration is complete to avoid layout shifts/mismatches
  if (!isMounted) {
    return null; 
  }

  const updateState = (updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setState((prev) => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 7) }));
  };

  const prevStep = () => {
    setState((prev) => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 1) }));
  };

  const setStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  return (
    <WizardContext.Provider value={{ state, updateState, nextStep, prevStep, setStep }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
