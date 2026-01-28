'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import {
  LayoutDashboard,
  BookOpen,
  Bookmark,
  User,
  LogOut,
  Menu,
  X,
  BookMarked,
} from 'lucide-react';
import Link from 'next/link';
import { config } from '@/lib/config';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/user/dashboard' },
    { icon: BookOpen, label: 'Katalog Buku', href: '/user/buku' },
    { icon: Bookmark, label: 'Peminjaman Saya', href: '/user/peminjaman' },
    { icon: User, label: 'Profile', href: '/user/profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center ml-4 lg:ml-0">
                <BookMarked className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Library Portal
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {/* Profile Photo */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500">
                  {user?.fotoProfile ? (
                    <img
                      src={config.buildFileUrl(user.fotoProfile)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling &&
                          (
                            (e.target as HTMLImageElement)
                              .nextElementSibling as HTMLElement
                          ).style.removeProperty('display');
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.nama?.charAt(0).toUpperCase() ||
                      user?.username?.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="hidden md:block text-sm text-gray-700">
                  Hello,{' '}
                  <span className="font-semibold">
                    {user?.nama || user?.username}
                  </span>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut size={16} className="mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } pt-16`}
      >
        <div className="h-full overflow-y-auto">
          <nav className="px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16">
        <div className="p-6">{children}</div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
