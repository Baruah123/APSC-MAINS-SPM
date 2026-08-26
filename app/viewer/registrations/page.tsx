export const dynamic = 'force-dynamic';

import React from 'react';
import { supabaseAdmin } from '@/lib/supabase/server';
import Link from 'next/link';
import { Search } from 'lucide-react';
import ImageThumbnail from '@/components/admin/ImageThumbnail';
import RemarkCell from '@/components/admin/RemarkCell';

export default async function AdminRegistrationsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const pageSize = 1000;

  // Fetch locations map dynamically
  const { data: locations } = await supabaseAdmin.from('test_locations').select('id, name');
  const locationMap: Record<string, string> = locations?.reduce((acc: any, loc: any) => {
    acc[loc.id] = loc.name;
    return acc;
  }, {}) || {};

  // Build query
  let supabaseQuery = supabaseAdmin
    .from('registrations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (query) {
    // Basic search across multiple fields
    supabaseQuery = supabaseQuery.or(`candidate_name.ilike.%${query}%,roll_number.ilike.%${query}%,mobile_number.ilike.%${query}%,registration_id.ilike.%${query}%`);
  }

  const { data: registrations, count, error } = await supabaseQuery;

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return (
    <div className="w-full mx-auto space-y-6 px-4 lg:px-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Registrations</h2>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex gap-4 mb-4">
          <form className="flex-1 max-w-md flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search by name, roll no, mobile, ID..."
                className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 placeholder-gray-400 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
              Search
            </button>
          </form>
          <div className="flex items-center gap-3">
            {/* Sync button removed for viewers */}
          </div>
          {/* Add more filters here: Mode, Status, Date */}
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse border border-gray-200 [&_th]:border [&_th]:border-gray-200 [&_td]:border [&_td]:border-gray-200">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200 text-sm font-semibold text-gray-600">
                <th className="p-4">Reg ID</th>
                <th className="p-4">Candidate</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Date</th>
                <th className="p-4 w-48">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {registrations?.map((reg) => (
                <tr key={reg.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-blue-600 whitespace-nowrap">{reg.registration_id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {reg.photo_storage_path ? (
                        <ImageThumbnail 
                          url={supabaseAdmin.storage.from('candidate-photos').getPublicUrl(reg.photo_storage_path).data.publicUrl}
                          alt={reg.candidate_name}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400">
                          <span className="text-[10px] uppercase font-semibold">No Pic</span>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900 whitespace-nowrap">{reg.candidate_name}</div>
                        <div className="text-gray-500 text-xs whitespace-nowrap">{reg.roll_number}</div>
                        <div className="text-blue-600 text-xs whitespace-nowrap mt-0.5">{reg.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700 whitespace-nowrap">{reg.mobile_number}</td>
                  <td className="p-4">
                    <div className="text-gray-700 capitalize font-medium whitespace-nowrap">{reg.mock_test_mode}</div>
                    {reg.mock_test_mode === 'offline' && (
                      <div className="text-xs text-gray-500 mt-1 space-y-0.5 whitespace-nowrap">
                        {reg.preferred_location && (
                          <div><span className="font-medium text-gray-600">1st:</span> {locationMap[reg.preferred_location] || reg.preferred_location}</div>
                        )}
                        {reg.second_preferred_location && (
                          <div><span className="font-medium text-gray-600">2nd:</span> {locationMap[reg.second_preferred_location] || reg.second_preferred_location}</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-gray-500 whitespace-nowrap">
                    {new Date(reg.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 min-w-[200px]">
                    <RemarkCell registrationId={reg.id} initialRemark={reg.remarks} />
                  </td>
                </tr>
              ))}
              {(!registrations || registrations.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No registrations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Link 
                href={`/admin/registrations?page=${Math.max(1, page - 1)}${query ? `&q=${query}` : ''}`}
                className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${page <= 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50'}`}
              >
                Previous
              </Link>
              <Link 
                href={`/admin/registrations?page=${Math.min(totalPages, page + 1)}${query ? `&q=${query}` : ''}`}
                className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${page >= totalPages ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50'}`}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
