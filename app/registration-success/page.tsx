'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Home } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('id');

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center animate-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h1>
      <div className="text-gray-600 mb-8 space-y-3 text-lg">
        <p className="font-medium text-gray-900">
          Thank you for submitting your details.
        </p>
        <p>
          In case you have any query or you want to make any changes in the details that you have shared, please call or WhatsApp us at:
        </p>
        <div className="flex justify-center items-center gap-3 mt-4">
          <a href="https://wa.me/916002122164" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 transition-colors border border-green-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
            WhatsApp
          </a>
          <a href="tel:+917996112300" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            7996112300
          </a>
        </div>
      </div>

      {registrationId && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 inline-block text-left max-w-md w-full mb-8">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Registration ID</p>
          <p className="text-2xl font-bold text-blue-900 tracking-wider mb-4">{registrationId}</p>
          <div className="text-sm text-gray-600 border-t border-gray-200 pt-3">
             Please keep this Registration ID safe for future reference on the day of your mock test.
          </div>
        </div>
      )}

      <div>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
          <Home className="w-5 h-5" />
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="animate-pulse bg-white w-full max-w-2xl h-96 rounded-xl shadow-sm" />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
