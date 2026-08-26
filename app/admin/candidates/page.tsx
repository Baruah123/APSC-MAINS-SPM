import React from 'react';
import CandidateImport from '@/components/admin/CandidateImport';
import { supabaseAdmin } from '@/lib/supabase/server';

// Server Component
export default async function AdminCandidatesPage() {
  
  // Fetch candidates and total count
  const { count } = await supabaseAdmin
    .from('apsc_candidates')
    .select('*', { count: 'exact', head: true });

  const { data: candidates } = await supabaseAdmin
    .from('apsc_candidates')
    .select('roll_number, candidate_name, created_at')
    .order('roll_number', { ascending: true })
    .limit(1000);

  return (
    <div className="max-w-[1400px] w-full mx-auto space-y-6 px-4 lg:px-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">APSC Candidates Database</h2>
          <p className="text-gray-500 mt-1">Manage the list of cleared candidates authorized to register.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 font-medium">
          Total Candidates: {count || 0}
        </div>
      </div>
      
      <CandidateImport />
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
         <h3 className="text-lg font-semibold text-gray-800 mb-4">Candidate List</h3>
         
         <div className="overflow-y-auto max-h-[500px] border border-gray-200 rounded-lg">
           <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 text-gray-700 sticky top-0 border-b border-gray-200">
               <tr>
                 <th className="px-4 py-3 font-semibold w-16 text-gray-500">Sl No.</th>
                 <th className="px-4 py-3 font-semibold">Roll Number</th>
                 <th className="px-4 py-3 font-semibold">Candidate Name</th>
                 <th className="px-4 py-3 font-semibold text-right">Added Date</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {candidates && candidates.length > 0 ? (
                 candidates.map((c, index) => (
                   <tr key={c.roll_number} className="hover:bg-gray-50 transition-colors">
                     <td className="px-4 py-3 text-gray-500 text-sm">{index + 1}</td>
                     <td className="px-4 py-3 font-medium text-gray-900">{c.roll_number}</td>
                     <td className="px-4 py-3 text-gray-700">{c.candidate_name}</td>
                     <td className="px-4 py-3 text-gray-500 text-right">
                       {new Date(c.created_at).toLocaleDateString()}
                     </td>
                   </tr>
                 ))
               ) : (
                 <tr>
                   <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                     No candidates found. Please import candidates.
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
