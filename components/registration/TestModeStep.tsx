'use client';

import React from 'react';
import { useWizard } from './WizardContext';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { modeSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

type ModeFormValues = z.infer<typeof modeSchema>;

export default function TestModeStep() {
  const { state, updateState, nextStep, prevStep } = useWizard();

  const modeForm = useRHForm<ModeFormValues>({
    resolver: zodResolver(modeSchema),
    defaultValues: { 
      mode: state.mockTestMode || undefined, 
      locationId: state.preferredLocation,
      secondLocationId: state.secondPreferredLocation
    },
  });

  const mode = modeForm.watch('mode');

  const onNext = (data: ModeFormValues) => {
    updateState({ 
      mockTestMode: data.mode, 
      preferredLocation: data.locationId || '',
      secondPreferredLocation: data.secondLocationId || ''
    });
    nextStep();
  };

  const offlineCities = [
    { id: 'a440fc53-cdfe-4e1a-a969-d2ea9b54267b', name: 'Dibrugarh' },
    { id: '11c779cf-f978-4b0b-95de-b042bff06007', name: 'Sibsagar' },
    { id: '301843ca-c372-4e10-811d-fcdc763978c8', name: 'Jorhat' },
    { id: '4e324de0-d104-4ba9-8ded-220883f5d0ce', name: 'Guwahati' },
    { id: 'abd06aa0-8366-47dd-8c07-16cc78831a8f', name: 'Tezpur' },
    { id: '5cc8157a-6f78-48f0-bdc9-c03d140eb3a1', name: 'Nalbari' },
    { id: 'd21e1bc4-6c40-4e43-9737-9235f476691e', name: 'Kokrajhar' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Mock Test Mode</h2>
      
      <form onSubmit={modeForm.handleSubmit(onNext)} className="space-y-6">
        <div className="space-y-3">
          <label className={`block p-4 border rounded-xl cursor-pointer transition-all ${mode === 'online' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex items-center gap-3">
              <input type="radio" value="online" {...modeForm.register('mode')} className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">Online Mode</div>
                <div className="text-sm text-gray-500">Take the mock test from anywhere</div>
              </div>
            </div>
          </label>
          
          <label className={`block p-4 border rounded-xl cursor-pointer transition-all ${mode === 'offline' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex items-center gap-3">
              <input type="radio" value="offline" {...modeForm.register('mode')} className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">Offline Mode</div>
                <div className="text-sm text-gray-500">Take the mock test at a designated center</div>
              </div>
            </div>
          </label>
          {modeForm.formState.errors.mode && (
            <p className="mt-1 text-sm text-red-600">{modeForm.formState.errors.mode.message}</p>
          )}
        </div>

        {mode === 'offline' && (
          <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
            
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#673ab7] py-4 px-6">
                <h3 className="text-white font-medium text-lg">Preferred Exam Center</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-900 font-medium">
                  In case your first preferred centre is not available, we may assign you to your second preference. Therefore, please select accordingly.
                </p>
              </div>
            </div>

            {/* 1st Preference Card */}
            <div className={`bg-white p-6 rounded-xl shadow-sm border ${modeForm.formState.errors.locationId ? 'border-red-500' : 'border-gray-200'}`}>
              <div className="mb-4">
                <label className="text-base text-gray-900">
                  1st Preference <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-700 mt-1">
                  (Please Select the Offline Centre as your 1st preference)
                </p>
              </div>
              <select
                {...modeForm.register('locationId')}
                className="w-full max-w-sm px-4 py-3 rounded border border-gray-300 text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Choose</option>
                {offlineCities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
              {modeForm.formState.errors.locationId && (
                <div className="flex items-center gap-2 mt-3 text-red-500 text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span>This is a required question</span>
                </div>
              )}
            </div>

            {/* 2nd Preference Card */}
            <div className={`bg-white p-6 rounded-xl shadow-sm border ${modeForm.formState.errors.secondLocationId ? 'border-red-500' : 'border-gray-200'}`}>
              <div className="mb-4">
                <label className="text-base text-gray-900">
                  2nd Preference <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-700 mt-1">
                  (Please Select the Offline Centre as your 2nd preference)
                </p>
              </div>
              <select
                {...modeForm.register('secondLocationId')}
                className="w-full max-w-sm px-4 py-3 rounded border border-gray-300 text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Choose</option>
                {offlineCities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
              {modeForm.formState.errors.secondLocationId && (
                <div className="flex items-center gap-2 mt-3 text-red-500 text-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span>This is a required question</span>
                </div>
              )}
            </div>
          </div>
        )}
        
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
            Review Registration
          </button>
        </div>
      </form>
    </div>
  );
}
