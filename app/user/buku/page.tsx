'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/Badge';
import { Modal } from '@/components/Modal';
import { api } from '@/lib/api';
import { Buku, KategoriBuku, BukuStatusResponse } from '@/types';
import { BukuFilterRequest } from '@/lib/viewmodels/requests/BukuRequest';
import { CreatePeminjamanRequest } from '@/lib/viewmodels/requests/PeminjamanRequest';
import {
  Search,
  BookOpen,
  Calendar,
  Hash,
  Library,
  MapPin,
} from 'lucide-react';

export default function UserBukuPage() {
  const router = useRouter();
  const [bukuList, setBukuList] = useState<Buku[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriBuku[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedBuku, setSelectedBuku] = useState<Buku | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusBuku, setStatusBuku] = useState<BukuStatusResponse | null>(null);
  const [isPinning, setIsPinning] = useState(false);

  // Helper function untuk format lokasi buku
  const formatLokasiBuku = (buku: Buku): string => {
    const parts = [];

    if (buku.lantai) parts.push(buku.lantai);
    if (buku.ruang) parts.push(buku.ruang);
    if (buku.rak) parts.push(buku.rak);
    if (buku.nomorBaris) parts.push(buku.nomorBaris);

    return parts.length > 0 ? parts.join(' – ') : 'Lokasi tidak tersedia';
  };

  useEffect(() => {
    fetchBukuList();
    fetchKategoriList();
  }, [currentPage, searchTerm, selectedKategori]);

  const fetchBukuList = async () => {
    try {
      setIsLoading(true);
      const filter: BukuFilterRequest = {
        pageNumber: currentPage + 1, // Backend 1-based
        pageSize: 10, // Changed from 12 to 10 items per page
        search: searchTerm || undefined,
        kategoriId: selectedKategori || undefined,
      };
      const response = await api.getAllBukuUser(filter);
      setBukuList(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      setBukuList([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKategoriList = async () => {
    try {
      const response = await api.getAllKategoriUser();
      setKategoriList(response);
    } catch (error) {
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchBukuList();
  };

  const handleViewDetails = async (buku: Buku) => {
    setSelectedBuku(buku);
    setIsModalOpen(true);
    setStatusBuku(null); // Reset status
    try {
      const status = await api.getStatusBuku(buku.id); // UUID string, not parseInt
      setStatusBuku(status);
    } catch (error) {
      // Jangan gagal total jika status tidak bisa diambil
      setStatusBuku(null);
    }
  };

  const handlePinjamBuku = async () => {
    if (!selectedBuku) return;

    // Backend expects UUID string (id field)
    const bukuId = selectedBuku.id;
    if (!bukuId || bukuId === '') {
      Swal.fire({
        icon: 'error',
        title: 'ID Buku Tidak Valid',
        text: 'Buku ini tidak memiliki ID yang valid. Silakan pilih buku lain.',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    // Check if user is authenticated
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      console.log({
        hasToken: !!token,
        tokenValid: token && token !== 'undefined' && token !== 'null',
        hasUser: !!user,
      });

      if (!token || token === 'undefined' || token === 'null') {
        Swal.fire({
          icon: 'warning',
          title: 'Belum Login',
          text: 'Anda belum login. Silakan login terlebih dahulu.',
          confirmButtonColor: '#3b82f6',
        }).then(() => {
          router.push('/auth/login');
        });
        return;
      }
    }

    setIsPinning(true);
    try {
      // Hitung tanggal kembali (7 hari dari tanggal pinjam)
      const tanggalPinjam = new Date();
      const tanggalKembali = new Date();
      tanggalKembali.setDate(tanggalPinjam.getDate() + 7);

      // Format tanggal ke YYYY-MM-DD
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const requestData = {
        bukuId: bukuId, // UUID string from backend
        tanggalPinjam: formatDate(tanggalPinjam), // Hari ini
        tanggalKembali: formatDate(tanggalKembali), // 7 hari dari sekarang
        statusBukuPinjaman: 'DIPINJAM',
        denda: 0,
      } as CreatePeminjamanRequest;
      console.log({
        bukuId: bukuId,
        bukuIdType: typeof bukuId,
        judul: selectedBuku.judulBuku,
        tanggalPinjam: formatDate(tanggalPinjam), // Hari ini
        tanggalKembali: formatDate(tanggalKembali), // 7 hari dari sekarang
        requestData,
      });


      await api.createPeminjaman(requestData);


      // Reset state
      setIsModalOpen(false);
      setSelectedBuku(null);
      setStatusBuku(null);

      // Refresh buku list untuk update stok
      fetchBukuList();

      // Tampilkan pesan sukses dengan SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Buku berhasil dipinjam! Mengalihkan ke halaman Peminjaman Saya...',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        confirmButtonColor: '#22c55e',
      });

      // Redirect ke halaman peminjaman setelah delay singkat
      setTimeout(() => {
        router.push('/user/peminjaman');
      }, 2000);
    } catch (error: any) {

      // Try to extract the actual error message from the response
      let errorMsg = 'Gagal meminjam buku';

      if (error.response?.data) {
        const data = error.response.data;

        // Check different possible error message locations
        // Prioritize 'data' field as it contains the actual error message from backend
        if (data.data && typeof data.data === 'string') {
          errorMsg = data.data;
        } else if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.message && !data.data) {
          // Only use 'message' if 'data' is not available
          errorMsg = data.message;
        } else if (data.error) {
          errorMsg = data.error;
        } else if (data.data && typeof data.data === 'object') {
          errorMsg = JSON.stringify(data.data);
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      // Add status code if available
      if (error.response?.status) {
        errorMsg = `Error ${error.response.status}: ${errorMsg}`;
      }

      Swal.fire({
        icon: 'error',
        title: 'Gagal Meminjam Buku',
        html: `${errorMsg}<br><br><small>Silakan coba lagi atau hubungi admin jika masalah berlanjut.</small>`,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK',
      });
    } finally {
      setIsPinning(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'TERSEDIA':
        return 'success';
      case 'DIPINJAM':
        return 'warning';
      case 'BOOKED':
        return 'danger';
      default:
        return 'info';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Katalog Buku</h1>
        <p className="mt-2 text-gray-600">
          Cari dan pinjam buku dari perpustakaan
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <form onSubmit={handleSearch} className="md:col-span-2 flex gap-4">
            <Input
              placeholder="Cari judul, pengarang, atau ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search size={20} className="mr-2" />
              Cari
            </Button>
          </form>

          <Select
            value={selectedKategori}
            onChange={(e) => {
              setSelectedKategori(e.target.value);
              setCurrentPage(0);
            }}
            options={[
              { value: '', label: 'Semua Kategori' },
              ...kategoriList.map((k) => ({ value: k.id, label: k.nama })),
            ]}
            disabled={kategoriList.length === 0}
          />
          {kategoriList.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Kategori tidak tersedia
            </p>
          )}
        </div>
      </Card>

      {/* Buku Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : bukuList.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bukuList.map((buku) => (
              <Card key={buku.id} className="hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {buku.judulBuku}
                      </h3>
                      <div className="mt-1">
                        <Badge variant="info">Penulis: {buku.penulis}</Badge>
                      </div>
                    </div>
                    <Badge
                      variant={getStatusVariant(buku.statusBuku?.statusBuku)}
                    >
                      {buku.statusBuku?.statusBuku}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Library size={16} />
                      <span>{buku.penerbit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{buku.tahunTerbit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span className="text-xs">{formatLokasiBuku(buku)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash size={16} />
                      <span>ISBN: {buku.isbn || '-'}</span>
                    </div>
                    {buku.namaKategoriBuku && (
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} />
                        <span>{buku.namaKategoriBuku}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-sm">
                      <span className="text-gray-600">Stok: </span>
                      <span className="font-semibold text-gray-900">
                        {buku.jumlahSalinan}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleViewDetails(buku)}
                      disabled={
                        buku.statusBuku?.statusBuku !== 'TERSEDIA' ||
                        buku.jumlahSalinan === 0
                      }
                    >
                      {buku.statusBuku?.statusBuku !== 'TERSEDIA' ||
                      buku.jumlahSalinan === 0
                        ? 'Tidak Tersedia'
                        : 'Lihat Detail'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <Pagination
              currentPage={currentPage + 1}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page - 1)}
            />
          )}
        </>
      ) : (
        <Card>
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tidak ada buku ditemukan
            </h3>
            <p className="text-gray-600">
              Coba kata kunci pencarian lain atau filter kategori yang berbeda
            </p>
          </div>
        </Card>
      )}

      {/* Book Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBuku(null);
          setStatusBuku(null);
        }}
        title="Detail Buku"
      >
        {selectedBuku && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {selectedBuku.judulBuku}
              </h3>
              <div className="mt-2">
                <Badge variant="info">Penulis: {selectedBuku.penulis}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Penerbit:</span>
                <p className="font-medium text-gray-900">
                  {selectedBuku.penerbit}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Tahun Terbit:</span>
                <p className="font-medium text-gray-900">
                  {selectedBuku.tahunTerbit}
                </p>
              </div>
              <div>
                <span className="text-gray-600">ISBN:</span>
                <p className="font-medium text-gray-900">
                  {selectedBuku.isbn || '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Kategori:</span>
                <p className="font-medium text-gray-900">
                  {selectedBuku.namaKategoriBuku || '-'}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Lokasi Rak:</span>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin size={16} className="text-gray-500" />
                  <p className="font-medium text-gray-900">
                    {formatLokasiBuku(selectedBuku)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedBuku(null);
                  setStatusBuku(null);
                }}
              >
                Tutup
              </Button>
              <Button
                className="flex-1"
                onClick={handlePinjamBuku}
                disabled={
                  isPinning ||
                  (statusBuku && statusBuku.stokTersedia === 0) ||
                  (selectedBuku && selectedBuku.jumlahSalinan === 0)
                }
              >
                {isPinning ? 'Memproses...' : 'Pinjam Buku'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
