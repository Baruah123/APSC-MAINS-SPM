'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CandidateImport() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ total: number; imported: number; errors: number; message?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON, treating it as an array of arrays since there are no headers.
      const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Map to required format (Assuming Column A is Roll Number, Column B is Name)
      // Filter out empty rows
      const candidates = json
        .filter(row => row.length >= 2 && row[0] && row[1])
        .map(row => ({
          roll_number: String(row[0]).trim(),
          candidate_name: String(row[1]).trim()
        }));

      if (candidates.length === 0) {
        throw new Error("No valid data found. Ensure the file has data in the first two columns (Roll Number, Name).");
      }

      // Send to server in batches or as a single chunk if small enough. 3000 rows is small enough for one POST request payload (~150KB).
      const res = await fetch('/api/admin/import-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidates })
      });

      const resData = await res.json();
      
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to import candidates');
      }

      setResult({
        total: candidates.length,
        imported: resData.imported,
        errors: resData.errors,
      });

    } catch (error: any) {
      setResult({ total: 0, imported: 0, errors: 0, message: error.message });
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Import APSC Candidates</h2>
      <p className="text-sm text-gray-500 mb-6">
        Upload a `.csv` or `.xlsx` file containing the cleared candidates. The file should not have headers. Column A should be the Roll Number and Column B should be the Candidate Name.
      </p>

      <div className="flex items-center gap-4">
        <input 
          type="file" 
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
          Select File & Import
        </button>
      </div>

      {result && (
        <div className={`mt-6 p-4 rounded-lg border ${result.message ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          {result.message ? (
            <div className="flex gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{result.message}</span>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 text-green-700 font-semibold mb-2">
                <CheckCircle2 className="w-5 h-5" />
                Import Complete
              </div>
              <ul className="text-sm text-green-800 space-y-1 ml-8">
                <li>Total Rows Found: {result.total}</li>
                <li>Successfully Imported: {result.imported}</li>
                <li>Skipped (Duplicates/Errors): {result.errors}</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
