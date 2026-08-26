'use client';

import React, { useState } from 'react';
import { useWizard } from './WizardContext';

const COURSE_OPTIONS = [
  'APSC Foundation Batch',
  'UPSC Foundation Batch',
  'Combined Foundation Batch',
  'Old Crash Course',
  'Crash Course / Test Series Student',
  'Not an enrolled student',
  'Others'
];

const YEARS = Array.from({ length: 8 }, (_, i) => String(2019 + i));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TIMINGS = ['9:30', '11:30', '4PM (English)', '4PM (Assamese)', '7PM'];

export default function CourseEnrollmentStep() {
  const { state, updateState, nextStep, prevStep } = useWizard();
  const [errorMsg, setErrorMsg] = useState('');

  const needsDetails = ['APSC Foundation Batch', 'UPSC Foundation Batch', 'Combined Foundation Batch', 'Old Crash Course', 'Crash Course / Test Series Student'].includes(state.courseEnrolledIn);
  const isOthers = state.courseEnrolledIn === 'Others';

  const onNext = () => {
    if (!state.courseEnrolledIn) {
      setErrorMsg('Please select a course.');
      return;
    }
    
    if (isOthers && !state.otherCourseDetails.trim()) {
      setErrorMsg('Please specify your course.');
      return;
    }

    if (needsDetails) {
      if (!state.yearOfEnrollment || !state.monthOfEnrollment || !state.batchTiming) {
        setErrorMsg('Please select year, month, and batch timing.');
        return;
      }
    }

    setErrorMsg('');
    nextStep();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Enrollment</h2>
      
      {errorMsg && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Enrolled In
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COURSE_OPTIONS.map((course) => (
              <label 
                key={course}
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200
                  ${state.courseEnrolledIn === course 
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
              >
                <input
                  type="radio"
                  name="courseEnrolledIn"
                  value={course}
                  checked={state.courseEnrolledIn === course}
                  onChange={(e) => {
                    updateState({ 
                      courseEnrolledIn: e.target.value,
                      // Reset fields if changing away from needsDetails
                      yearOfEnrollment: '',
                      monthOfEnrollment: '',
                      batchTiming: '',
                      otherCourseDetails: ''
                    });
                    setErrorMsg('');
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-600"
                />
                <span className="ml-3 text-gray-900 font-medium text-sm">{course}</span>
              </label>
            ))}
          </div>
        </div>

        {isOthers && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please Specify
            </label>
            <input
              type="text"
              value={state.otherCourseDetails}
              onChange={(e) => {
                updateState({ otherCourseDetails: e.target.value });
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Enter course details"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
            />
          </div>
        )}

        {needsDetails && (
          <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300 bg-gray-50 p-5 rounded-xl border border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year of Enrollment
              </label>
              <select
                value={state.yearOfEnrollment}
                onChange={(e) => {
                  updateState({ yearOfEnrollment: e.target.value });
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-white"
              >
                <option value="">Select Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month of Enrollment
              </label>
              <select
                value={state.monthOfEnrollment}
                onChange={(e) => {
                  updateState({ monthOfEnrollment: e.target.value });
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-white"
              >
                <option value="">Select Month</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Timing
              </label>
              <select
                value={state.batchTiming}
                onChange={(e) => {
                  updateState({ batchTiming: e.target.value });
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-white"
              >
                <option value="">Select Timing</option>
                {TIMINGS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
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
            type="button"
            onClick={onNext}
            className="w-full sm:flex-1 bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
}
