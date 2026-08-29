export const dynamic = 'force-dynamic';

import React from 'react';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Users, CheckCircle, MonitorSmartphone, MapPin } from 'lucide-react';

export default async function ViewerDashboardPage() {
  
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

  const { data: offlineRegistrations } = await supabaseAdmin
    .from('registrations')
    .select('preferred_location, second_preferred_location')
    .eq('mock_test_mode', 'offline');

  const { data: locations } = await supabaseAdmin.from('test_locations').select('id, name');
  const locationMap: Record<string, string> = locations?.reduce((acc: any, loc: any) => {
    acc[loc.id] = loc.name;
    return acc;
  }, {}) || {};

  const pref1Counts: Record<string, number> = {};
  const pref2Counts: Record<string, number> = {};

  offlineRegistrations?.forEach(reg => {
    if (reg.preferred_location) {
      pref1Counts[reg.preferred_location] = (pref1Counts[reg.preferred_location] || 0) + 1;
    }
    if (reg.second_preferred_location) {
      pref2Counts[reg.second_preferred_location] = (pref2Counts[reg.second_preferred_location] || 0) + 1;
    }
  });

  const topPref1 = Object.entries(pref1Counts)
    .map(([id, count]) => ({ name: locationMap[id] || id, count }))
    .sort((a, b) => b.count - a.count);

  const topPref2 = Object.entries(pref2Counts)
    .map(([id, count]) => ({ name: locationMap[id] || id, count }))
    .sort((a, b) => b.count - a.count);

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Box 1: 1st Preference */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top 1st Preference Locations</h3>
          <div className="space-y-3">
            {topPref1.length > 0 ? topPref1.map((loc, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-medium text-gray-800">{loc.name}</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-full text-sm">{loc.count}</span>
              </div>
            )) : (
              <p className="text-gray-500 text-sm">No preferences recorded yet.</p>
            )}
          </div>
        </div>

        {/* Box 2: 2nd Preference */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top 2nd Preference Locations</h3>
          <div className="space-y-3">
            {topPref2.length > 0 ? topPref2.map((loc, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-medium text-gray-800">{loc.name}</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-sm">{loc.count}</span>
              </div>
            )) : (
              <p className="text-gray-500 text-sm">No preferences recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
