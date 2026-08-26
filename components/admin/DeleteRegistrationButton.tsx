'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeleteRegistrationButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to permanently delete this registration?');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete');
      }

      // Refresh the page data
      router.refresh();
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`Error during delete: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`p-2 rounded-md transition-colors ${
        isDeleting 
          ? 'text-gray-400 cursor-not-allowed' 
          : 'text-red-500 hover:bg-red-50'
      }`}
      title="Delete Registration"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
