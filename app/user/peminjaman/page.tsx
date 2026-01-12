'use client';

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Modal } from '@/components/Modal';
import { Pagination } from '@/components/Pagination';
import { api } from '@/lib/api';
import { PeminjamanBuku, PaginatedResponse } from '@/types';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function UserPeminjamanPage() {
  const [peminjamanList, setPeminjamanList] = useState<PeminjamanBuku[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<PeminjamanBuku | null>(null);
  const [isReturning, setIsReturning] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchPeminjamanList();
  }, [currentPage]);

  const fetchPeminjamanList = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const response = await api.getAllPeminjamanUser({
        pageNumber: currentPage + 1,
        pageSize: 10,
        sortColumn: 'tanggalPinjam',
        sortColumnDir: 'DESC',
      }) as PaginatedResponse<PeminjamanBuku> | PeminjamanBuku[];

      // Handle paginated response
      if (response && Array.isArray(response)) {
        // Old format: simple array
        setPeminjamanList(response);
        setTotalPages(1);
      } else if (response && 'content' in response) {
        // New format: paginated response
        setPeminjamanList(response.content || []);
        setTotalPages(response.totalPages || 0);
      } else {
        setPeminjamanList([]);
        setTotalPages(0);
      }

      // Log each item for debugging
      if (response && Array.isArray(response)) {
        response.forEach((p: PeminjamanBuku, index: number) => {
          console.log({
            id: p.id,
            judulBuku: p.judulBuku || p.buku?.judulBuku,
            statusBukuPinjaman: p.statusBukuPinjaman || p.status,
            tanggalPinjam: p.tanggalPinjam,
          });
        });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message ||
                      error.response?.data?.data ||
                      error.message ||
                      'Gagal mengambil data peminjaman';
      setFetchError(errorMsg);
      setPeminjamanList([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnBook = async () => {
    if (!selectedPeminjaman?.id) return;

    setIsReturning(true);
    try {
      await api.requestReturnPeminjaman(selectedPeminjaman.id);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Permintaan pengembalian buku berhasil! Menunggu persetujuan admin.',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      setIsReturnModalOpen(false);
      setSelectedPeminjaman(null);
      fetchPeminjamanList();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message ||
                      error.response?.data?.data ||
                      error.message ||
                      'Gagal meminta pengembalian buku';
      Swal.fire({
        icon: 'error',
        title: 'Gagal Meminta Pengembalian',
        html: `${errorMsg}<br><br><small>Silakan coba lagi atau hubungi admin.</small>`,
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsReturning(false);
    }
  };

  const openReturnModal = (peminjaman: PeminjamanBuku) => {
    setSelectedPeminjaman(peminjaman);
    setIsReturnModalOpen(true);
  };

  const isLate = (tanggalKembali: string) => {
    return new Date(tanggalKembali) < new Date();
  };

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

  const activePeminjaman = peminjamanList.filter((p) => {
    const status = (p.statusBukuPinjaman || p.status || '').toUpperCase();

    // Anggap aktif jika status mengandung "DIPINJAM" atau "PINJAM"
    return status.includes('DIPINJAM') || status.includes('PINJAM');
  });

  const completedPeminjaman = peminjamanList.filter((p) => {
    const status = (p.statusBukuPinjaman || p.status || '').toUpperCase();

    // Anggap completed jika status mengandung "KEMBALI" atau bukan "DIPINJAM"
    return !status.includes('DIPINJAM') && !status.includes('PINJAM');
  });


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Peminjaman Saya</h1>
        <p className="mt-2 text-gray-600">Kelola peminjaman buku Anda</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Peminjaman</p>
              <p className="text-3xl font-bold mt-1">{peminjamanList.length}</p>
            </div>
            <Calendar className="h-12 w-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Sedang Dipinjam</p>
              <p className="text-3xl font-bold mt-1">{activePeminjaman.length}</p>
            </div>
            <Clock className="h-12 w-12 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Selesai</p>
              <p className="text-3xl font-bold mt-1">{completedPeminjaman.length}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-purple-200" />
          </div>
        </Card>
      </div>

      {isLoading ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-600">Loading...</div>
          </div>
        </Card>
      ) : fetchError ? (
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gagal Memuat Data
            </h3>
            <p className="text-gray-600 mb-4">
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
        <>
          {/* Active Peminjaman */}
          {activePeminjaman.length > 0 && (
            <Card title="Peminjaman Aktif" subtitle="Buku yang sedang Anda pinjam">
              <div className="space-y-4">
                {activePeminjaman.map((peminjaman) => {
                  // Get judul buku dan penulis dari response backend atau nested object
                  const judulBuku = peminjaman.judulBuku && peminjaman.judulBuku.trim() !== ''
                    ? peminjaman.judulBuku
                    : (peminjaman.buku?.judulBuku && peminjaman.buku.judulBuku.trim() !== ''
                      ? peminjaman.buku.judulBuku
                      : (peminjaman.buku?.judul && peminjaman.buku.judul.trim() !== ''
                        ? peminjaman.buku.judul
                        : 'Judul tidak tersedia'));
                  const penulis = peminjaman.penulis && peminjaman.penulis.trim() !== ''
                    ? peminjaman.penulis
                    : (peminjaman.buku?.penulis && peminjaman.buku.penulis.trim() !== ''
                      ? peminjaman.buku.penulis
                      : (peminjaman.buku?.pengarang && peminjaman.buku.pengarang.trim() !== ''
                        ? peminjaman.buku.pengarang
                        : 'Penulis tidak tersedia'));
                  const tanggalKembali = peminjaman.tanggalKembali || peminjaman.tanggalHarusKembali || '';
                  const status = peminjaman.statusBukuPinjaman || peminjaman.status || 'DIPINJAM';

                  return (
                    <div
                      key={peminjaman.id}
                      className={`border rounded-lg p-4 ${
                        isLate(tanggalKembali)
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {judulBuku}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {penulis}
                          </p>
                        </div>
                        {isLate(tanggalKembali) && (
                          <div className="flex items-center gap-1">
                            <Badge variant="danger">
                              <AlertCircle size={14} />
                            </Badge>
                            <span className="text-red-600 text-sm font-medium">Terlambat</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">Tgl Pinjam:</span>
                          <p className="font-medium text-gray-900">
                            {format(new Date(peminjaman.tanggalPinjam), 'dd/MM/yyyy')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Tenggat:</span>
                          <p className="font-medium text-gray-900">
                            {format(new Date(tanggalKembali), 'dd/MM/yyyy')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <p>
                            <Badge variant={getStatusVariant(status)}>
                              {status}
                            </Badge>
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Denda:</span>
                          <p className="font-medium text-gray-900">
                            {peminjaman.denda ? `Rp ${peminjaman.denda.toLocaleString()}` : 'Rp 0'}
                          </p>
                        </div>
                      </div>

                    {peminjaman.catatan && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                        <p className="text-sm text-yellow-800">
                          <span className="font-medium">Catatan:</span> {peminjaman.catatan}
                        </p>
                      </div>
                    )}

                    <Button
                      size="sm"
                      onClick={() => openReturnModal(peminjaman)}
                      className="w-full md:w-auto"
                    >
                      Ajukan Pengembalian
                    </Button>
                  </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Completed Peminjaman */}
          {completedPeminjaman.length > 0 && (
            <Card
              title="Riwayat Peminjaman"
              subtitle="Buku yang sudah Anda kembalikan"
            >
              <div className="space-y-4">
                {completedPeminjaman.map((peminjaman) => {
                  const judulBuku = peminjaman.judulBuku && peminjaman.judulBuku.trim() !== ''
                    ? peminjaman.judulBuku
                    : (peminjaman.buku?.judulBuku && peminjaman.buku.judulBuku.trim() !== ''
                      ? peminjaman.buku.judulBuku
                      : (peminjaman.buku?.judul && peminjaman.buku.judul.trim() !== ''
                        ? peminjaman.buku.judul
                        : 'Judul tidak tersedia'));
                  const penulis = peminjaman.penulis && peminjaman.penulis.trim() !== ''
                    ? peminjaman.penulis
                    : (peminjaman.buku?.penulis && peminjaman.buku.penulis.trim() !== ''
                      ? peminjaman.buku.penulis
                      : (peminjaman.buku?.pengarang && peminjaman.buku.pengarang.trim() !== ''
                        ? peminjaman.buku.pengarang
                        : 'Penulis tidak tersedia'));
                  const tanggalKembali = peminjaman.tanggalKembali || peminjaman.tanggalHarusKembali || '';
                  const tanggalDikembalikan = peminjaman.tanggalKembali || '-';
                  const tanggalHarusKembali = peminjaman.tanggalHarusKembali || tanggalKembali;
                  const status = peminjaman.statusBukuPinjaman || peminjaman.status || 'DIPINJAM';

                  return (
                    <div
                      key={peminjaman.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {judulBuku}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {penulis}
                          </p>
                        </div>
                        <Badge variant={getStatusVariant(status)}>
                          {status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Tgl Pinjam:</span>
                          <p className="font-medium text-gray-900">
                            {format(new Date(peminjaman.tanggalPinjam), 'dd/MM/yyyy')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Tgl Kembali:</span>
                          <p className="font-medium text-gray-900">
                            {tanggalDikembalikan !== '-'
                              ? format(new Date(tanggalDikembalikan), 'dd/MM/yyyy')
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Tenggat:</span>
                          <p className="font-medium text-gray-900">
                            {format(new Date(tanggalHarusKembali), 'dd/MM/yyyy')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Denda:</span>
                          <p className="font-medium text-gray-900">
                            {peminjaman.denda ? `Rp ${peminjaman.denda.toLocaleString()}` : 'Rp 0'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* No Peminjaman */}
          {peminjamanList.length === 0 && (
            <Card>
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Belum ada peminjaman
                </h3>
                <p className="text-gray-600 mb-4">
                  Anda belum pernah meminjam buku dari perpustakaan
                </p>
              </div>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 0 && (
            <Pagination
              currentPage={currentPage + 1}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page - 1)}
            />
          )}
        </>
      )}

      {/* Return Request Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setSelectedPeminjaman(null);
        }}
        title="Ajukan Pengembalian Buku"
      >
        {selectedPeminjaman && (() => {
          const judulBuku = selectedPeminjaman.judulBuku || selectedPeminjaman.buku?.judulBuku || selectedPeminjaman.buku?.judul || 'Judul tidak tersedia';
          const penulis = selectedPeminjaman.penulis || selectedPeminjaman.buku?.penulis || selectedPeminjaman.buku?.pengarang || 'Penulis tidak tersedia';

          return (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900 mb-1">
                  {judulBuku}
                </p>
                <p className="text-sm text-gray-600">
                  {penulis}
                </p>
              </div>

              <p className="text-gray-700">
                Apakah Anda yakin ingin mengajukan pengembalian buku ini?
                Pengembalian memerlukan persetujuan dari admin.
              </p>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsReturnModalOpen(false);
                    setSelectedPeminjaman(null);
                  }}
                  disabled={isReturning}
                >
                  Batal
                </Button>
                <Button onClick={handleReturnBook} disabled={isReturning}>
                  {isReturning ? 'Memproses...' : 'Ya, Ajukan'}
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
