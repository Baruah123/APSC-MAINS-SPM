export const dynamic = 'force-dynamic';

import React from 'react';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Users, CheckCircle, MonitorSmartphone, MapPin } from 'lucide-react';

export default async function AdminDashboardPage() {
  
  // Fetch some basic stats
  const { count: totalRegistrations } = await supabaseAdmin
    .from('registrations')
    .select('*', { count: 'exact', head: true });

  const { count: onlineCount } = await supabaseAdmin
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('mock_test_mode', 'online');

  const { count: offlineCount } = await supabaseAdmin
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('mock_test_mode', 'offline');

  const { count: completedCount } = await supabaseAdmin
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  const { data: latestRegistrations } = await supabaseAdmin
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600">Total Registrations</h3>
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalRegistrations || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600">Online Mode</h3>
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <MonitorSmartphone className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{onlineCount || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600">Offline Mode</h3>
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{offlineCount || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600">Completed</h3>
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{completedCount || 0}</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Latest 10 Registrations</h3>
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse border border-gray-200 [&_th]:border [&_th]:border-gray-200 [&_td]:border [&_td]:border-gray-200">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200 text-sm font-semibold text-gray-600">
                <th className="p-4">Candidate</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Course</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {latestRegistrations?.map((reg) => (
                <tr key={reg.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-gray-900 whitespace-nowrap">{reg.candidate_name}</div>
                    <div className="text-gray-500 text-xs whitespace-nowrap">{reg.roll_number}</div>
                    <div className="text-blue-600 text-xs whitespace-nowrap mt-0.5">{reg.email}</div>
                  </td>
                  <td className="p-4 text-gray-700 whitespace-nowrap">{reg.mobile_number}</td>
                  <td className="p-4 max-w-xs">
                    <div className="text-gray-900 font-medium">{reg.course_enrolled_in || 'N/A'}</div>
                    {reg.course_enrolled_in === 'Others' && reg.other_course_details && (
                      <div className="text-xs text-gray-500 mt-0.5">{reg.other_course_details}</div>
                    )}
                    {['APSC Foundation Batch', 'UPSC Foundation Batch', 'Combined Foundation Batch', 'Old Crash Course', 'Crash Course / Test Series Student'].includes(reg.course_enrolled_in) && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {reg.year_of_enrollment} | {reg.month_of_enrollment} | {reg.batch_timing}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-gray-700 capitalize font-medium whitespace-nowrap">{reg.mock_test_mode}</span>
                  </td>
                  <td className="p-4 text-gray-500 whitespace-nowrap">
                    {new Date(reg.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!latestRegistrations || latestRegistrations.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No registrations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
