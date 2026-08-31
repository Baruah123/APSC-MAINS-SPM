'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthUser {
  uid: string;
  email: string;
  role: 'admin' | 'viewer';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const useAdminAuth = () => useContext(AuthContext);

export default function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login' || pathname === '/viewer/login';

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const response = await fetch('/api/admin/auth');
        const data = await response.json();

        if (isMounted) {
          if (data.authenticated && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
            if (!isLoginPage) {
              router.push('/admin/login');
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
          if (!isLoginPage) {
            router.push('/admin/login');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, router, isLoginPage]);

  const logout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    router.push('/admin/login');
  };

  // If loading, show a spinner to avoid flash of content
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Verifying authorization...</p>
      </div>
    );
  }

  // If not authenticated and not on login page, don't render children (redirect is happening)
  if (!user && !isLoginPage) {
    return null; 
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
