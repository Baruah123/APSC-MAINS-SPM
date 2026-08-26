'use client';

import React from 'react';
import { useWizard } from './WizardContext';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

type EmailFormValues = z.infer<typeof emailSchema>;

export default function EmailStep() {
  const { state, updateState, nextStep, prevStep } = useWizard();

  const emailForm = useRHForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: state.email },
  });

  const onNext = (data: EmailFormValues) => {
    updateState({ email: data.email });
    nextStep();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Email Address</h2>
      
      <form onSubmit={emailForm.handleSubmit(onNext)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Enter Your Email Address</label>
          <input
            {...emailForm.register('email')}
            type="email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
            placeholder="e.g. rahul@example.com"
          />
          {emailForm.formState.errors.email && (
            <p className="mt-1 text-sm text-red-600">{emailForm.formState.errors.email.message}</p>
          )}
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
            type="submit"
            className="w-full sm:flex-1 bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
