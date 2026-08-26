'use client';

import React, { useState } from 'react';
import { useWizard } from './WizardContext';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const LOCATION_MAP: Record<string, string> = {
  'a440fc53-cdfe-4e1a-a969-d2ea9b54267b': 'Dibrugarh',
  '11c779cf-f978-4b0b-95de-b042bff06007': 'Sibsagar',
  '301843ca-c372-4e10-811d-fcdc763978c8': 'Jorhat',
  '4e324de0-d104-4ba9-8ded-220883f5d0ce': 'Guwahati',
  'abd06aa0-8366-47dd-8c07-16cc78831a8f': 'Tezpur',
  '5cc8157a-6f78-48f0-bdc9-c03d140eb3a1': 'Nalbari',
  'd21e1bc4-6c40-4e43-9737-9235f476691e': 'Kokrajhar',
};

export default function ReviewStep() {
  const { state, setStep } = useWizard();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [acceptance, setAcceptance] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Fallback to supabase URL if preview isn't available (e.g. they refreshed)
  const photoUrl = state.photoPreview || (state.photoPath 
    ? supabase.storage.from('candidate-photos').getPublicUrl(state.photoPath).data.publicUrl 
    : null);

  const onSubmit = async () => {
    if (!acceptance) {
      setErrorMsg('You must accept the terms and conditions.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/registration/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          acceptance: true,
          email: state.email,
          mock_test_mode: state.mockTestMode,
          preferred_location: state.preferredLocation,
          second_preferred_location: state.secondPreferredLocation,
          course_enrolled_in: state.courseEnrolledIn,
          other_course_details: state.otherCourseDetails,
          year_of_enrollment: state.yearOfEnrollment,
          month_of_enrollment: state.monthOfEnrollment,
          batch_timing: state.batchTiming
        })
      });
      
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Failed to submit registration');
      
      sessionStorage.removeItem('registration_wizard_state');
      router.push(`/registration-success?id=${result.registrationId}`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Registration</h2>
      
      {errorMsg && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Candidate Name</p>
              <p className="font-semibold text-gray-900">{state.candidateName || 'N/A'}</p>
            </div>
            {/* Candidate Name is read-only, no edit button */}
          </div>
          
          <div className="flex justify-between items-start pt-3 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">APSC Roll Number</p>
              <p className="font-medium text-gray-900">{state.rollNumber || 'N/A'}</p>
            </div>
            {/* Roll Number is read-only here, unless they go all the way back */}
          </div>

          <div className="flex justify-between items-start pt-3 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Mobile Number</p>
              <p className="font-medium text-gray-900">+91 {state.mobile}</p>
            </div>
          </div>

          <div className="flex justify-between items-start pt-3 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Candidate Photo</p>
              {photoUrl ? (
                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200" style={{ width: '100px', height: '100px' }}>
                  <img src={photoUrl} alt="Candidate" className="w-full h-full object-cover" />
                </div>
              ) : (
                <p className="text-sm text-red-500 font-medium mt-1">Missing Photo</p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-start pt-3 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="font-medium text-gray-900">{state.email || 'N/A'}</p>
            </div>
          </div>

          <div className="flex justify-between items-start pt-3 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Course Enrollment</p>
              <p className="font-medium text-gray-900">{state.courseEnrolledIn || 'N/A'}</p>
              {state.courseEnrolledIn === 'Others' && state.otherCourseDetails && (
                <p className="text-sm text-gray-600 mt-1">Details: {state.otherCourseDetails}</p>
              )}
              {['APSC Foundation Batch', 'UPSC Foundation Batch', 'Combined Foundation Batch', 'Old Crash Course', 'Crash Course / Test Series Student'].includes(state.courseEnrolledIn) && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600"><span className="font-medium text-gray-700">Year:</span> {state.yearOfEnrollment}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium text-gray-700">Month:</span> {state.monthOfEnrollment}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium text-gray-700">Batch Timing:</span> {state.batchTiming}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-start pt-3 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Mock Test Mode</p>
              <p className="font-medium text-gray-900 capitalize">{state.mockTestMode || 'N/A'}</p>
              {state.mockTestMode === 'offline' && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600"><span className="font-medium text-gray-700">1st Preference:</span> {LOCATION_MAP[state.preferredLocation] || state.preferredLocation}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium text-gray-700">2nd Preference:</span> {LOCATION_MAP[state.secondPreferredLocation] || state.secondPreferredLocation}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input 
              type="checkbox" 
              className="mt-1 w-5 h-5 text-blue-600 rounded" 
              checked={acceptance}
              onChange={(e) => setAcceptance(e.target.checked)}
            />
            <div className="text-sm text-gray-700">
              <span className="font-semibold block mb-1">Declaration-</span>
              I hereby declare that the details provided above are true to the best of my knowledge. I understand that the Mock Test is being conducted by SPM IAS Academy for practice purposes only, and the academy reserves the right to use my registration details for communication regarding this test and related academic activities. I also agree to abide by the exam guidelines (both online & offline) as shared by the academy.
            </div>
          </label>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={() => setStep(6)}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Back
          </button>
          <button
            onClick={onSubmit}
            disabled={loading || !acceptance}
            className="w-full sm:flex-1 bg-green-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-100 transition-colors disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Submit Registration'}
          </button>
        </div>
      </div>
    </div>
  );
}
