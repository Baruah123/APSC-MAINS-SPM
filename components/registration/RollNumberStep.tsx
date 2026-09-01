'use client';

import React, { useState } from 'react';
import { useWizard } from './WizardContext';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rollNumberSchema } from '@/lib/validation/schemas';
import { z } from 'zod';
import { Loader2, CheckCircle } from 'lucide-react';

type RollNumberFormValues = z.infer<typeof rollNumberSchema>;

export default function RollNumberStep() {
  const { state, updateState, nextStep, prevStep } = useWizard();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successName, setSuccessName] = useState('');

  const rollForm = useRHForm<RollNumberFormValues>({
    resolver: zodResolver(rollNumberSchema),
    defaultValues: { rollNumber: state.rollNumber },
  });

  const onValidate = async (data: RollNumberFormValues) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessName('');
    
    try {
      const res = await fetch('/api/registration/validate-roll-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Failed to validate roll number');
      
      updateState({ rollNumber: data.rollNumber, candidateName: result.candidateName });
      setSuccessName(result.candidateName);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">APSC Roll Number</h2>
      
      {errorMsg && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      {!successName && !state.candidateName ? (
        <form onSubmit={rollForm.handleSubmit(onValidate)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter APSC CCE 2025 Prelims Roll Number</label>
            <input
              {...rollForm.register('rollNumber')}
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none uppercase"
              placeholder="e.g. 1000275"
            />
            {rollForm.formState.errors.rollNumber && (
              <p className="mt-1 text-sm text-red-600">{rollForm.formState.errors.rollNumber.message}</p>
            )}
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-medium py-3.5 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors disabled:opacity-70 flex justify-center items-center text-[15px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Validate & Continue'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="p-5 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">Roll Number Validated</h3>
            </div>
            <div className="ml-9 space-y-1">
              <p className="text-sm text-green-800">
                <span className="font-medium">Roll Number:</span> {state.rollNumber}
              </p>
              <p className="text-sm text-green-800">
                <span className="font-medium">Candidate Name:</span> {state.candidateName}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setSuccessName('');
                updateState({ candidateName: '', rollNumber: '' });
                rollForm.reset({ rollNumber: '' });
              }}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={nextStep}
              className="w-full sm:flex-1 bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors flex justify-center items-center"
            >
              Continue to Mobile Verification
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
