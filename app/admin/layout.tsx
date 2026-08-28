'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileSpreadsheet, Settings, LogOut } from 'lucide-react';
import AdminAuthProvider from '@/components/admin/AdminAuthProvider';
import LogoutButton from '@/components/admin/LogoutButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <AdminAuthProvider>
        {children}
      </AdminAuthProvider>
    );
  }

  return (
    <AdminAuthProvider>
      <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-48 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-lg font-bold text-gray-900">Admin Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
            <LayoutDashboard className="w-5 h-5 text-gray-500" />
            Dashboard
          </Link>
          <Link href="/admin/registrations" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
            <FileSpreadsheet className="w-5 h-5 text-gray-500" />
            Registrations
          </Link>
          {/* APSC Candidates link hidden as per request */}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <LogoutButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
    </AdminAuthProvider>
  );
}
