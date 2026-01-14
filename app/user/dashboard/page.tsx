'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { peminjamanService } from '@/lib/services';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { PeminjamanBuku } from '@/types';
import { BookOpen, Bookmark, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [peminjamanList, setPeminjamanList] = useState<PeminjamanBuku[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchPeminjamanList();
  }, []);

  const fetchPeminjamanList = async () => {
    try {
      setFetchError(null);
      const response = await peminjamanService.getAllPeminjamanUser();

      if (response && response.length > 0) {
        setPeminjamanList(response);
      } else {
        // Empty array is valid - means no peminjaman yet
        setPeminjamanList([]);
      }
    } catch (error) {
      setFetchError('Gagal memuat data peminjaman. Silakan coba lagi.');
      setPeminjamanList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const activePeminjaman = peminjamanList.filter((p) => {
    const status = p.statusBukuPinjaman || p.status || 'DIPINJAM';
    return status === 'DIPINJAM' || status === 'DENDA';
  });

  const overduePeminjaman = peminjamanList.filter((p) => {
    const tanggalKembali = p.tanggalKembali || p.tanggalHarusKembali || '';
    const status = p.statusBukuPinjaman || p.status || 'DIPINJAM';
    const isOverdue = new Date(tanggalKembali) < new Date();
    return isOverdue && (status === 'DIPINJAM' || status === 'DENDA');
  });

  const isLate = (tanggalHarusKembali: string) => {
    return new Date(tanggalHarusKembali) < new Date();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Selamat datang di Perpustakaan Kampus, {user?.nama || user?.username}!
        </p>
      </div>

      {/* Stats Cards */}
      {fetchError ? (
        <Card className="bg-red-50 border-red-200">
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Gagal Memuat Data
            </h3>
            <p className="text-red-700 mb-4">
              {fetchError}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setFetchError(null);
                fetchPeminjamanList();
              }}
            >
              Coba Lagi
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Buku Dipinjam</p>
                <p className="text-3xl font-bold mt-1">{activePeminjaman.length}</p>
              </div>
              <BookOpen className="h-12 w-12 text-blue-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Peminjaman</p>
                <p className="text-3xl font-bold mt-1">{peminjamanList.length}</p>
              </div>
              <Bookmark className="h-12 w-12 text-green-200" />
            </div>
          </Card>

          <Card
            className={`bg-gradient-to-br ${
              overduePeminjaman.length > 0
                ? 'from-red-500 to-red-600'
                : 'from-gray-500 to-gray-600'
            } text-white`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Terlambat</p>
                <p className="text-3xl font-bold mt-1">{overduePeminjaman.length}</p>
              </div>
              <Clock className="h-12 w-12 text-red-200" />
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/user/buku">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cari Buku</h3>
                <p className="text-sm text-gray-600">
                  Telusuri katalog buku perpustakaan
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/user/peminjaman">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Bookmark className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Peminjaman Saya</h3>
                <p className="text-sm text-gray-600">
                  Lihat riwayat peminjaman buku
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Active Peminjaman */}
      <Card title="Peminjaman Aktif" subtitle={`Anda memiliki ${activePeminjaman.length} buku yang dipinjam`}>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : activePeminjaman.length > 0 ? (
          <div className="space-y-4">
            {activePeminjaman.map((peminjaman) => {
              const judulBuku = peminjaman.judulBuku || 'Judul tidak tersedia';
              const penulis = peminjaman.penulis || 'Penulis tidak tersedia';
              const tanggalKembali = peminjaman.tanggalKembali || peminjaman.tanggalHarusKembali || '';
              const status = peminjaman.statusBukuPinjaman || peminjaman.status || 'DIPINJAM';

              const getStatusVariant = (status: string) => {
                if (status === 'DENDA') return 'danger';
                if (status === 'DIPINJAM') return 'info';
                return 'warning';
              };

              return (
                <div
                  key={peminjaman.id}
                  className={`border rounded-lg p-4 ${
                    status === 'DENDA' || isLate(tanggalKembali)
                      ? 'border-red-300 bg-red-50'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {judulBuku}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {penulis}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(status)}>
                        {status}
                      </Badge>
                      {isLate(tanggalKembali) && status !== 'DENDA' && (
                        <div className="flex items-center gap-1">
                          <Badge variant="danger">
                            <AlertCircle size={14} />
                          </Badge>
                          <span className="text-red-600 text-sm font-medium">Terlambat</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Tgl Pinjam:</span>{' '}
                      {format(new Date(peminjaman.tanggalPinjam), 'dd/MM/yyyy')}
                    </div>
                    <div>
                      <span className="font-medium">Tenggat:</span>{' '}
                      {format(new Date(tanggalKembali), 'dd/MM/yyyy')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Tidak ada peminjaman aktif.{' '}
            <Link href="/user/buku" className="text-blue-600 hover:underline">
              Cari buku sekarang
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
