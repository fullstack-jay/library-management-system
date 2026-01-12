'use client';

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/Badge';
import { Dropdown } from '@/components/Dropdown';
import { api } from '@/lib/api';
import { PeminjamanBuku, UpdatePeminjamanRequest, StatusBukuPinjaman } from '@/types';
import {
  Calendar,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  CheckCircle as CheckCircleIcon,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminPeminjamanPage() {
  const [peminjamanList, setPeminjamanList] = useState<PeminjamanBuku[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeminjaman, setSelectedPeminjaman] =
    useState<PeminjamanBuku | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('tanggalPinjam');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [formData, setFormData] = useState<UpdatePeminjamanRequest>({
    status: 'DIPINJAM' as 'PENDING' | 'DIPINJAM' | 'DENDA' | 'SUDAH_DIKEMBALIKAN',
    statusBukuPinjaman: 'DIPINJAM' as 'PENDING' | 'DIPINJAM' | 'DENDA' | 'SUDAH_DIKEMBALIKAN',
    tanggalKembali: new Date().toISOString().split('T')[0],
    denda: undefined,
    catatan: '',
  });
  const [approvingPeminjamanId, setApprovingPeminjamanId] = useState<
    string | null
  >(null);

  // Mapping sortBy ke backend column names
  const getBackendSortColumn = (sortBy: string): string => {
    const columnMap: Record<string, string> = {
      tanggalPinjam: 'tanggalPinjam',
      tanggalKembali: 'tanggalHarusKembali', // Backend might use tanggalHarusKembali
      nama: 'nama',
      judulBuku: 'judulBuku',
    };
    return columnMap[sortBy] || sortBy;
  };

  useEffect(() => {
    fetchPeminjamanList();
  }, [currentPage, statusFilter, sortBy, sortOrder]);

  const fetchPeminjamanList = async () => {
    try {
      setIsLoading(true);
      const backendSortColumn = getBackendSortColumn(sortBy);

      const response = await api.getAllPeminjamanAdmin({
        page: currentPage,
        size: 10,
        status: statusFilter || undefined,
        sortColumn: backendSortColumn,
        sortColumnDir: sortOrder,
      });

      setPeminjamanList(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalItems(response.totalElements || 0);
    } catch (error) {
      setPeminjamanList([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (peminjaman: PeminjamanBuku) => {
    setSelectedPeminjaman(peminjaman);

    // Use statusBukuPinjaman or fallback to status, ensure it's a valid status type
    const rawStatus = peminjaman.statusBukuPinjaman || peminjaman.status || 'DIPINJAM';
    const status = rawStatus as 'PENDING' | 'DIPINJAM' | 'DENDA' | 'SUDAH_DIKEMBALIKAN';

    setFormData({
      status: status,
      statusBukuPinjaman: status,
      tanggalKembali: peminjaman.tanggalKembali
        ? new Date(peminjaman.tanggalKembali).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      denda: peminjaman.denda || 0,
      catatan: peminjaman.catatan || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPeminjaman(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedId = selectedPeminjaman?.id;
    if (!selectedPeminjaman || !selectedId) return;

    try {
      // Ensure all required fields have values before sending to backend
      const submitData: UpdatePeminjamanRequest = {
        tanggalKembali: formData.tanggalKembali,
        status: formData.status || ('DIPINJAM' as 'PENDING' | 'DIPINJAM' | 'DENDA' | 'SUDAH_DIKEMBALIKAN'),
        statusBukuPinjaman: formData.statusBukuPinjaman || ('DIPINJAM' as 'PENDING' | 'DIPINJAM' | 'DENDA' | 'SUDAH_DIKEMBALIKAN'),
        denda: formData.denda ?? 0,
        catatan: formData.catatan || '',
      };

      await api.updatePeminjamanAdmin(selectedId, submitData);
      handleCloseModal();
      fetchPeminjamanList();

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Peminjaman berhasil diupdate.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengupdate',
        text: 'Gagal mengupdate peminjaman. Silakan coba lagi.',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleReturnBook = async (peminjaman: PeminjamanBuku) => {
    setSelectedPeminjaman(peminjaman);
    setFormData({
      status: 'SUDAH_DIKEMBALIKAN' as 'PENDING' | 'DIPINJAM' | 'DENDA' | 'SUDAH_DIKEMBALIKAN',
      statusBukuPinjaman: 'SUDAH_DIKEMBALIKAN' as 'PENDING' | 'DIPINJAM' | 'DENDA' | 'SUDAH_DIKEMBALIKAN',
      tanggalKembali: new Date().toISOString().split('T')[0],
      denda: undefined,
      catatan: '',
    });
    setIsModalOpen(true);
  };

  const handleViewDetail = (peminjaman: PeminjamanBuku) => {
    setSelectedPeminjaman(peminjaman);
    // Open modal in view mode (read-only)
    setIsModalOpen(true);
  };

  const handleEdit = (peminjaman: PeminjamanBuku) => {
    setSelectedPeminjaman(peminjaman);

    // Use statusBukuPinjaman or fallback to status, ensure it's a valid status type
    const rawStatus = peminjaman.statusBukuPinjaman || peminjaman.status || 'DIPINJAM';
    const status = rawStatus as 'PENDING' | 'DIPINJAM' | 'DENDA' | 'SUDAH_DIKEMBALIKAN';

    setFormData({
      status: status,
      statusBukuPinjaman: status,
      tanggalKembali: peminjaman.tanggalKembali
        ? new Date(peminjaman.tanggalKembali).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      denda: peminjaman.denda || undefined,
      catatan: peminjaman.catatan || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (peminjaman: PeminjamanBuku) => {
    const peminjamanId = peminjaman.id;
    if (!peminjamanId) return;

    const bukuJudul =
      peminjaman.judulBuku || peminjaman.buku?.judulBuku || 'ini';

    Swal.fire({
      title: 'Hapus Peminjaman?',
      text: `Apakah Anda yakin ingin menghapus peminjaman buku "${bukuJudul}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.deletePeminjaman(peminjamanId);
          Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Peminjaman berhasil dihapus.',
            timer: 1500,
            showConfirmButton: false,
          });
          fetchPeminjamanList();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus',
            text: 'Peminjaman gagal dihapus. Silakan coba lagi.',
            confirmButtonColor: '#ef4444',
          });
        }
      }
    });
  };

  const handleApproveReturn = async (peminjaman: PeminjamanBuku) => {
    const peminjamanId = peminjaman.id;
    if (!peminjamanId) return;

    const bukuJudul =
      peminjaman.judulBuku || peminjaman.buku?.judulBuku || 'ini';
    const mahasiswaNama =
      peminjaman.nama ||
      peminjaman.mahasiswa?.nama ||
      '-';
    const mahasiswaNim = peminjaman.nim || peminjaman.mahasiswa?.nim || '';

    // Show confirmation dialog
    Swal.fire({
      title: 'Setujui Pengembalian?',
      html: `Apakah Anda yakin ingin menyetujui pengembalian buku ini?<br><br><strong>Buku:</strong> ${bukuJudul}<br><strong>Mahasiswa:</strong> ${mahasiswaNama}${
        mahasiswaNim && mahasiswaNim !== '-' ? ` (${mahasiswaNim})` : ''
      }`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Setujui',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setApprovingPeminjamanId(peminjamanId);
          await api.approveReturn(peminjamanId);
          Swal.fire({
            icon: 'success',
            title: 'Berhasil Disetujui!',
            text: 'Pengembalian buku berhasil disetujui!',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          fetchPeminjamanList();
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
          setApprovingPeminjamanId(null);
        }
      }
    });
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

  const isLate = (tanggalHarusKembali: string) => {
    return new Date(tanggalHarusKembali) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Manajemen Peminjaman
          </h1>
          <p className="mt-2 text-gray-600">Kelola peminjaman buku mahasiswa</p>
        </div>
      </div>

      {/* Filter */}
      <Card>
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Input
              placeholder="Cari nama mahasiswa, judul buku..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
              className="pr-10"
            />
            <Search
              size={18}
              className="absolute right-3 top-3 text-gray-400 pointer-events-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filter Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter Status
              </label>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(0);
                }}
                options={[
                  { value: '', label: 'Semua Status' },
                  { value: 'DIPINJAM', label: 'Dipinjam' },
                  { value: 'SUDAH_DIKEMBALIKAN', label: 'Sudah Dikembalikan' },
                  { value: 'DENDA', label: 'Terlambat' },
                  { value: 'PENDING', label: 'Pending' },
                ]}
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urutkan Berdasarkan
              </label>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'tanggalPinjam', label: 'Tanggal Pinjam' },
                  { value: 'tanggalKembali', label: 'Tenggat' },
                  { value: 'nama', label: 'Nama Mahasiswa' },
                  { value: 'judulBuku', label: 'Judul Buku' },
                ]}
              />
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urutan
              </label>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'ASC' | 'DESC')}
                options={[
                  { value: 'DESC', label: 'Menurun (Terbaru)' },
                  { value: 'ASC', label: 'Menaik (Terlama)' },
                ]}
              />
            </div>
          </div>

          {/* Reset Filters */}
          {(searchTerm || statusFilter) && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setCurrentPage(0);
                }}
              >
                Reset Semua Filter
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Peminjaman Table */}
      <Card>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mahasiswa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Buku
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tanggal Pinjam
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tenggat
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Approve
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {peminjamanList.length > 0 ? (
                  peminjamanList.map((peminjaman, index) => {
                    // Get data from backend response or nested object
                    const mahasiswaNama =
                      peminjaman.nama && peminjaman.nama.trim() !== ''
                        ? peminjaman.nama
                        : peminjaman.mahasiswa?.nama &&
                          peminjaman.mahasiswa.nama.trim() !== ''
                        ? peminjaman.mahasiswa.nama
                        : '-';
                    const mahasiswaNim =
                      peminjaman.nim && peminjaman.nim.trim() !== ''
                        ? peminjaman.nim
                        : peminjaman.mahasiswa?.nim &&
                          peminjaman.mahasiswa.nim.trim() !== ''
                        ? peminjaman.mahasiswa.nim
                        : '-';
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
                    const tanggalKembali =
                      peminjaman.tanggalKembali ||
                      peminjaman.tanggalHarusKembali ||
                      '';
                    const status =
                      peminjaman.statusBukuPinjaman ||
                      peminjaman.status ||
                      'DIPINJAM';

                    // Calculate row number based on sort order and current data count
                    // ASC (Menaik): 1, 2, 3... | DESC (Menurun): 3, 2, 1 (if 3 items)
                    const rowNumber =
                      sortOrder === 'DESC'
                        ? currentPage * 10 + peminjamanList.length - index // 3, 2, 1 for 3 items on page 1
                        : currentPage * 10 + index + 1; // 1, 2, 3 for page 1

                    return (
                      <tr
                        key={peminjaman.id}
                        className={`hover:bg-gray-50 ${
                          isLate(tanggalKembali) &&
                          (status === 'DIPINJAM' || status.includes('DIPINJAM'))
                            ? 'bg-red-50'
                            : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {rowNumber}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Dropdown
                            trigger={
                              <Button size="sm" variant="outline">
                                <MoreVertical size={16} />
                              </Button>
                            }
                            options={[
                              {
                                label: 'Detail Data',
                                onClick: () => handleViewDetail(peminjaman),
                                icon: <Eye size={16} />,
                              },
                              {
                                label: 'Edit Data',
                                onClick: () => handleEdit(peminjaman),
                                icon: <Pencil size={16} />,
                              },
                              ...(status === 'DIPINJAM' ||
                              status.includes('DIPINJAM')
                                ? [
                                    {
                                      label: 'Kembalikan',
                                      onClick: () =>
                                        handleReturnBook(peminjaman),
                                      icon: <CheckCircleIcon size={16} />,
                                    },
                                  ]
                                : []),
                              {
                                label: 'Hapus Data',
                                onClick: () => handleDelete(peminjaman),
                                variant: 'danger',
                                icon: <Trash2 size={16} />,
                              },
                            ]}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{mahasiswaNama}</div>
                            {mahasiswaNim && mahasiswaNim !== '-' && (
                              <div className="text-xs text-gray-500">
                                {mahasiswaNim}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {bukuJudul}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {format(
                            new Date(peminjaman.tanggalPinjam),
                            'dd/MM/yyyy'
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            {format(new Date(tanggalKembali), 'dd/MM/yyyy')}
                            {isLate(tanggalKembali) &&
                              (status === 'DIPINJAM' ||
                                status.includes('DIPINJAM')) && (
                                <Badge variant="danger">Terlambat</Badge>
                              )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {peminjaman.tanggalKembali
                            ? format(
                                new Date(peminjaman.tanggalKembali),
                                'dd/MM/yyyy'
                              )
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant={getStatusVariant(status)}>
                            {status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {peminjaman.denda
                            ? `Rp ${peminjaman.denda.toLocaleString()}`
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {status === 'PENDING' && (
                            <Button
                              size="sm"
                              onClick={() => handleApproveReturn(peminjaman)}
                              disabled={approvingPeminjamanId === peminjaman.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {approvingPeminjamanId === peminjaman.id ? (
                                'Memproses...'
                              ) : (
                                <>
                                  <CheckCircleIcon size={16} className="mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                          )}
                          {status !== 'PENDING' && (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No peminjaman found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          {/* Info Items */}
          <div className="text-sm text-gray-600">
            {totalItems > 0 && (
              <span>
                Menampilkan <strong>{peminjamanList.length}</strong> dari{' '}
                <strong>{totalItems}</strong> peminjaman
                {totalPages > 1 && (
                  <span>
                    {' '}
                    (Halaman {currentPage + 1} dari {totalPages})
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <Pagination
              currentPage={currentPage + 1}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page - 1)}
            />
          )}
        </div>
      </Card>

      {/* Return/Update Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Update Peminjaman"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {(() => {
            // Extract data from backend response or nested object
            const mahasiswaNama =
              selectedPeminjaman?.nama && selectedPeminjaman.nama.trim() !== ''
                ? selectedPeminjaman.nama
                : selectedPeminjaman?.mahasiswa?.nama &&
                  selectedPeminjaman.mahasiswa.nama.trim() !== ''
                ? selectedPeminjaman.mahasiswa.nama
                : '-';
            const mahasiswaNim =
              selectedPeminjaman?.nim && selectedPeminjaman.nim.trim() !== ''
                ? selectedPeminjaman.nim
                : selectedPeminjaman?.mahasiswa?.nim &&
                  selectedPeminjaman.mahasiswa.nim.trim() !== ''
                ? selectedPeminjaman.mahasiswa.nim
                : '';
            const bukuJudul =
              selectedPeminjaman?.judulBuku &&
              selectedPeminjaman.judulBuku.trim() !== ''
                ? selectedPeminjaman.judulBuku
                : selectedPeminjaman?.buku?.judulBuku &&
                  selectedPeminjaman.buku.judulBuku.trim() !== ''
                ? selectedPeminjaman.buku.judulBuku
                : selectedPeminjaman?.buku?.judul &&
                  selectedPeminjaman.buku.judul.trim() !== ''
                ? selectedPeminjaman.buku.judul
                : '-';

            return (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700">
                  Mahasiswa: {mahasiswaNama}
                  {mahasiswaNim && mahasiswaNim !== '-'
                    ? ` (${mahasiswaNim})`
                    : ''}
                </p>
                <p className="text-sm text-gray-600">Buku: {bukuJudul}</p>
                <p className="text-sm text-gray-600">
                  Tanggal Pinjam:{' '}
                  {selectedPeminjaman &&
                    format(
                      new Date(selectedPeminjaman.tanggalPinjam),
                      'dd/MM/yyyy'
                    )}
                </p>
              </div>
            );
          })()}

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as 'PENDING' | 'DIPINJAM' | 'DENDA' | 'SUDAH_DIKEMBALIKAN'
              })
            }
            options={[
              { value: 'DIPINJAM', label: 'Dipinjam' },
              { value: 'SUDAH_DIKEMBALIKAN', label: 'Sudah Dikembalikan' },
              { value: 'DENDA', label: 'Terlambat' },
              { value: 'PENDING', label: 'Pending' },
            ]}
            required
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Kembali
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.tanggalKembali}
              onChange={(e) =>
                setFormData({ ...formData, tanggalKembali: e.target.value })
              }
              required
            />
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Denda (Rp)
          </label>
          <input
            type="number"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.denda || ''}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({
                ...formData,
                denda: value === '' ? undefined : parseInt(value),
              });
            }}
            min="0"
            placeholder="Masukkan denda (kosongkan jika tidak ada)"
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              value={formData.catatan}
              onChange={(e) =>
                setFormData({ ...formData, catatan: e.target.value })
              }
              placeholder="Catatan tambahan (opsional)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button type="submit">Update</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
