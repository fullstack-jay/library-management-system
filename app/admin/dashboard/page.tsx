'use client';

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { adminService } from '@/lib/services';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Select } from '@/components/Select';
import {
  BookOpen,
  Users,
  Bookmark,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface DashboardStats {
  totalBuku: number;
  totalMahasiswa: number;
  totalPeminjaman: number;
  bukuDipinjam: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPeminjaman, setRecentPeminjaman] = useState<any[]>([]);
  const [pendingReturns, setPendingReturns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [recentError, setRecentError] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [approvingReturnId, setApprovingReturnId] = useState<string | null>(
    null
  );
  const [isCheckingOverdue, setIsCheckingOverdue] = useState(false);
  const [overdueCheckResult, setOverdueCheckResult] = useState<{
    updated: number;
    message: string;
  } | null>(null);

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>('tanggalPinjam');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  useEffect(() => {
    fetchDashboardData();
  }, [sortColumn, sortOrder]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setStatsError(null);
      setRecentError(null);
      setPendingError(null);

      // Fetch dashboard stats independently
      try {
        const statsResponse = await adminService.getDashboardStats();
        setStats(statsResponse);
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.data ||
          error.message ||
          'Gagal memuat statistik';
        setStatsError(errorMsg);
        setStats({
          totalBuku: 0,
          totalMahasiswa: 0,
          totalPeminjaman: 0,
          bukuDipinjam: 0,
        });
        // Show toast notification
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat Statistik',
          text: errorMsg,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }

      // Fetch recent peminjaman independently
      try {
        const recentResponse = await adminService.getRecentPeminjaman(
          sortColumn,
          sortOrder
        );
        setRecentPeminjaman(recentResponse);
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.data ||
          error.message ||
          'Gagal memuat peminjaman terbaru';
        setRecentError(errorMsg);
        setRecentPeminjaman([]);
        // Show toast notification
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat Peminjaman',
          text: errorMsg,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReturn = async (peminjamanId: string) => {
    try {
      setApprovingReturnId(peminjamanId);
      await adminService.approveReturn(peminjamanId);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengembalian buku berhasil disetujui!',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      fetchDashboardData(); // Refresh data
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.data ||
        error.message ||
        'Gagal menyetujui pengembalian';
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyetujui',
        text: errorMsg,
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setApprovingReturnId(null);
    }
  };

  const handleCheckOverdue = async () => {
    try {
      setIsCheckingOverdue(true);
      setOverdueCheckResult(null);

      const result = await adminService.checkOverduePeminjaman();
      setOverdueCheckResult(result);

      // Show alert with result
      if (result.updated > 0) {
        Swal.fire({
          icon: 'success',
          title: `${result.updated} Peminjaman Diperbarui`,
          html: `${result.message}<br><br><strong>${result.updated}</strong> peminjaman berhasil diperbarui menjadi DENDA.`,
          confirmButtonColor: '#22c55e',
        });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Info',
          text: result.message,
          confirmButtonColor: '#3b82f6',
        });
      }

      // Refresh data to show updated status
      fetchDashboardData();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.data ||
        error.message ||
        'Gagal mengecek peminjaman terlambat';
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengecek',
        text: errorMsg,
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsCheckingOverdue(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome to Library Management System Admin
          </p>
        </div>
        <Button
          onClick={handleCheckOverdue}
          disabled={isCheckingOverdue}
          className="bg-red-600 hover:bg-orange-700 text-white"
        >
          {isCheckingOverdue ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Memeriksa...
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 mr-2" />
              Cek Peminjaman Terlambat
            </>
          )}
        </Button>
      </div>

      {/* Show overdue check result if available */}
      {overdueCheckResult && overdueCheckResult.updated > 0 && (
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-900">
                {overdueCheckResult.updated} Peminjaman Diperbarui
              </p>
              <p className="text-sm text-green-700">
                {overdueCheckResult.message}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOverdueCheckResult(null)}
            >
              Tutup
            </Button>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="space-y-4">
        {statsError && (
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">{statsError}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchDashboardData()}
              >
                Retry
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Buku</p>
                <p className="text-3xl font-bold mt-1">
                  {stats?.totalBuku || 0}
                </p>
              </div>
              <BookOpen className="h-12 w-12 text-blue-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Mahasiswa</p>
                <p className="text-3xl font-bold mt-1">
                  {stats?.totalMahasiswa || 0}
                </p>
              </div>
              <Users className="h-12 w-12 text-green-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Peminjaman</p>
                <p className="text-3xl font-bold mt-1">
                  {stats?.totalPeminjaman || 0}
                </p>
              </div>
              <Bookmark className="h-12 w-12 text-purple-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Buku Dipinjam</p>
                <p className="text-3xl font-bold mt-1">
                  {stats?.bukuDipinjam || 0}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-200" />
            </div>
          </Card>
        </div>
      </div>

      {/* Pending Returns */}
      {pendingReturns.length > 0 && (
        <Card
          title="Pengembalian Menunggu Persetujuan"
          subtitle={`Ada ${pendingReturns.length} pengembalian yang menunggu persetujuan`}
          className="border-amber-200 bg-amber-50"
        >
          {pendingError && (
            <div className="mb-4">
              <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    {pendingError}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchDashboardData()}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {pendingReturns.map((pendingReturn) => {
              const judulBuku = pendingReturn.judulBuku ?? '-';
              const mahasiswaNama =
                pendingReturn.namaMahasiswa ?? pendingReturn.nama ?? '-';
              const mahasiswaNim = pendingReturn.nim ?? '-';

              return (
                <div
                  key={pendingReturn.id}
                  className="bg-white border border-amber-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {judulBuku}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {mahasiswaNama} ({mahasiswaNim})
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Tanggal Pinjam:{' '}
                        {new Date(
                          pendingReturn.tanggalPinjam
                        ).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <Badge variant="warning">MENUNGGU PERSETUJUAN</Badge>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveReturn(pendingReturn.id)}
                      disabled={approvingReturnId === pendingReturn.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {approvingReturnId === pendingReturn.id ? (
                        <>Memproses...</>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Setujui Pengembalian
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent Peminjaman */}
      <Card title="Recent Peminjaman" subtitle="Latest book borrowings">
        {recentError && (
          <div className="mb-4">
            <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">{recentError}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchDashboardData()}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Urutkan Berdasarkan"
            value={sortColumn}
            onChange={(e) => setSortColumn(e.target.value)}
            options={[
              { value: 'nama', label: 'Nama Mahasiswa' },
              { value: 'nim', label: 'NIM' },
              { value: 'judulBuku', label: 'Judul Buku' },
              { value: 'tanggalPinjam', label: 'Tanggal Pinjam' },
              { value: 'tanggalKembali', label: 'Tanggal Kembali' },
              { value: 'statusBukuPinjaman', label: 'Status' },
            ]}
          />
          <Select
            label="Urutan"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'ASC' | 'DESC')}
            options={[
              { value: 'DESC', label: 'Menurun (Terbaru)' },
              { value: 'ASC', label: 'Menaik (Terlama)' },
            ]}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Mahasiswa
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  NIM
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Buku
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tanggal Pinjam
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tanggal Kembali
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Denda
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentPeminjaman && recentPeminjaman.length > 0 ? (
                recentPeminjaman.map((peminjaman, index) => {
                  // Extract data with flexible fallback
                  // Backend response has: no, namaMahasiswa, nim, judulBuku, statusBukuPinjaman
                  const no = peminjaman.no ?? index + 1;
                  const mahasiswaNama =
                    peminjaman.namaMahasiswa &&
                    peminjaman.namaMahasiswa.trim() !== ''
                      ? peminjaman.namaMahasiswa
                      : peminjaman.nama && peminjaman.nama.trim() !== ''
                      ? peminjaman.nama
                      : peminjaman.mahasiswa?.nama &&
                        peminjaman.mahasiswa.nama.trim() !== ''
                      ? peminjaman.mahasiswa.nama
                      : '-';
                  const mahasiswaNim = peminjaman.nim || '-';
                  const bukuJudul =
                    peminjaman.judulBuku && peminjaman.judulBuku.trim() !== ''
                      ? peminjaman.judulBuku
                      : peminjaman.buku?.judulBuku &&
                        peminjaman.buku.judulBuku.trim() !== ''
                      ? peminjaman.buku.judulBuku
                      : peminjaman.buku?.judul &&
                        peminjaman.buku.judul.trim() !== ''
                      ? peminjaman.buku.judul
                      : '-';
                  const status =
                    peminjaman.statusBukuPinjaman ||
                    peminjaman.status ||
                    'DIPINJAM';

                  const getStatusVariant = (status: string) => {
                    switch (status) {
                      case 'SUDAH_DIKEMBALIKAN':
                        return 'success';
                      case 'PENDING':
                        return 'warning';
                      case 'DENDA':
                        return 'danger';
                      case 'DIPINJAM':
                        return 'info';
                      default:
                        return 'info';
                    }
                  };

                  return (
                    <tr key={peminjaman.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{no}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {mahasiswaNama}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {mahasiswaNim}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {bukuJudul}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(peminjaman.tanggalPinjam).toLocaleDateString(
                          'id-ID'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {peminjaman.tanggalKembali
                          ? new Date(peminjaman.tanggalKembali).toLocaleDateString(
                              'id-ID'
                            )
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={getStatusVariant(status)}>
                          {status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {peminjaman.denda !== undefined &&
                        peminjaman.denda !== null
                          ? `Rp ${peminjaman.denda.toLocaleString('id-ID')}`
                          : '-'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No recent peminjaman found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
