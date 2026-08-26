'use client';

import React, { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

export default function RemarkCell({ 
  registrationId, 
  initialRemark 
}: { 
  registrationId: string; 
  initialRemark: string; 
}) {
  const [remark, setRemark] = useState(initialRemark || 'N/A');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const saveRemark = async () => {
    if (remark === initialRemark) {
      setIsEditing(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/viewer/update-remark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: registrationId, remark })
      });
      if (response.ok) {
        setIsEditing(false);
      } else {
        alert('Failed to save remark');
      }
    } catch (err) {
      alert('Error saving remark');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveRemark();
    }
    if (e.key === 'Escape') {
      setRemark(initialRemark || 'N/A');
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
        <Loader2 className="w-4 h-4 animate-spin" /> Saving
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          type="text"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveRemark}
          className="w-full px-2 py-1 text-sm text-gray-900 bg-white border border-blue-500 rounded outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button onMouseDown={(e) => { e.preventDefault(); saveRemark(); }} className="text-green-600">
          <Check className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)} 
      className="cursor-text px-3 py-2 rounded-md bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm text-sm text-gray-700 min-h-[36px] flex items-center justify-between group transition-all"
      title="Click to edit remark"
    >
      <span className={`truncate mr-2 ${(!remark || remark === 'N/A') ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
        {(!remark || remark === 'N/A') ? 'Click to add remark...' : remark}
      </span>
      <div className="opacity-0 group-hover:opacity-100 flex-shrink-0 flex items-center text-blue-600 transition-opacity">
        <span className="text-[10px] uppercase font-bold tracking-wider">Edit</span>
      </div>
    </div>
  );
}
