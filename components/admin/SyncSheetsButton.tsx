'use client';

import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SyncSheetsButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/admin/sync-sheets', {
        method: 'POST',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sync');
      }

      if (data.syncedCount === 0 && data.failedCount === 0) {
        alert(data.message || 'All registrations are already synced.');
      } else {
        alert(`Sync Complete!\n\nSuccessful: ${data.syncedCount}\nFailed: ${data.failedCount}`);
      }

      // Refresh the page data
      router.refresh();
    } catch (error: any) {
      console.error('Sync error:', error);
      alert(`Error during sync: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
        isSyncing 
          ? 'bg-blue-400 text-white cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Syncing...' : 'Sync to Google Sheets'}
    </button>
  );
}
