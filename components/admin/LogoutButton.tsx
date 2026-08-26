'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { useAdminAuth } from './AdminAuthProvider';

export default function LogoutButton() {
  const { logout } = useAdminAuth();

  const handleLogout = async () => {
    // Clear server cookie
    await fetch('/api/admin/logout', { method: 'POST' });
    // Clear firebase
    await logout();
  };

  return (
    <button 
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-3 py-2 text-red-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
    >
      <LogOut className="w-5 h-5" />
      Logout
    </button>
  );
}
