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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-96 flex items-center justify-center">
           <p className="text-gray-500">Registrations Trend Chart Placeholder</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-96 flex items-center justify-center">
           <p className="text-gray-500">Registrations by Location Chart Placeholder</p>
        </div>
      </div>
    </div>
  );
}
