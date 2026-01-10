'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && mounted) {
      if (isAuthenticated) {
        // Check user role and redirect accordingly
        if (user) {
          if (user.role === 'ADMIN') {
            router.push('/admin/dashboard');
          } else {
            router.push('/user/dashboard');
          }
        }
      } else {
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, router, user, mounted]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-600 p-4 rounded-full">
            <BookOpen className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Library Management System
        </h1>
        <p className="text-gray-600 mb-8">Loading...</p>
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
      </div>
    </div>
  );
}
