import React from 'react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100 text-center">
        <img 
          src="/logo.webp" 
          alt="SPM IAS Academy Logo" 
          width="180" 
          height="60" 
          className="mx-auto mb-8 object-contain"
        />
        <div className="bg-blue-50 text-blue-800 p-6 rounded-lg border border-blue-100">
          <h1 className="text-2xl font-bold mb-3">Registration Closed</h1>
          <p className="text-lg">
            Thank you! All submissions are done.
          </p>
        </div>
      </div>
    </div>
  );
}
