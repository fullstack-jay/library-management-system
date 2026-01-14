'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { Pagination } from '@/components/Pagination';
import { Dropdown } from '@/components/Dropdown';
import { mahasiswaService } from '@/lib/services';
import { Mahasiswa, CreateMahasiswaRequest } from '@/types';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Phone,
  MapPin,
  Eye,
  MoreVertical,
} from 'lucide-react';

export default function AdminMahasiswaPage() {
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<Mahasiswa | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState('nama');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [formData, setFormData] = useState<
    CreateMahasiswaRequest & { status?: 'AKTIF' | 'TIDAK_AKTIF' }
  >({
    nama: '',
    nim: '',
    jurusan: '',
    alamat: '',
    phoneNumber: '',
    email: '',
    username: '',
    password: '',
    status: 'AKTIF',
  });

  useEffect(() => {
    fetchMahasiswaList();
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  const fetchMahasiswaList = async () => {
    try {
      setIsLoading(true);
      const response = await mahasiswaService.getAllMahasiswa({
        page: currentPage,
        size: 10,
        search: searchTerm || undefined,
        sortColumn: sortBy,
        sortColumnDir: sortOrder,
      });

      // Filter by status di frontend jika backend tidak support
      let filteredContent = response.content || [];
      if (statusFilter) {
        filteredContent = filteredContent.filter(
          (m) => m.status === statusFilter
        );
      }

      setMahasiswaList(filteredContent);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalElements || 0);
    } catch (error) {
      // Set empty arrays on error to prevent undefined errors
      setMahasiswaList([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0); // Reset ke halaman 1 saat search berubah
  };

  const handleOpenModal = (mahasiswa?: Mahasiswa) => {
    if (mahasiswa) {
      setSelectedMahasiswa(mahasiswa);
      setFormData({
        nama: mahasiswa.nama,
        nim: mahasiswa.nim,
        jurusan: mahasiswa.jurusan,
        alamat: mahasiswa.alamat,
        phoneNumber: mahasiswa.phoneNumber,
        email: mahasiswa.email || '',
        username: mahasiswa.username || '',
        password: '', // Password kosong saat edit untuk keamanan
        status: mahasiswa.status,
      });
    } else {
      setSelectedMahasiswa(null);
      setFormData({
        nama: '',
        nim: '',
        jurusan: '',
        alamat: '',
        phoneNumber: '',
        email: '',
        username: '',
        password: '',
        status: 'AKTIF',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMahasiswa(null);
    setFormData({
      nama: '',
      nim: '',
      jurusan: '',
      alamat: '',
      phoneNumber: '',
      email: '',
      username: '',
      password: '',
      status: 'AKTIF',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedMahasiswa) {
        // Update existing mahasiswa
        const updateData: any = {
          nama: formData.nama,
          nim: formData.nim,
          jurusan: formData.jurusan,
          alamat: formData.alamat,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          username: formData.username,
          status: formData.status as 'AKTIF' | 'TIDAK_AKTIF',
        };

        // Hanya kirim password jika diisi
        if (formData.password) {
          updateData.password = formData.password;
        }

        await mahasiswaService.updateMahasiswa(
          selectedMahasiswa.id,
          updateData
        );
      } else {
        // Create new mahasiswa
        await mahasiswaService.createMahasiswa({
          nama: formData.nama,
          nim: formData.nim,
          jurusan: formData.jurusan,
          alamat: formData.alamat,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          username: formData.username,
          password: formData.password,
        });
      }
      handleCloseModal();
      fetchMahasiswaList();
    } catch (error) {}
  };

  const handleDelete = async () => {
    if (selectedMahasiswa) {
      try {
        // Backend expects userId to delete both mahasiswa and user records
        const userId = selectedMahasiswa.userId || selectedMahasiswa.id;

        if (!userId) {
          alert('Error: UserId tidak ditemukan untuk mahasiswa ini');
          return;
        }

        await mahasiswaService.deleteMahasiswa(userId);
        setIsDeleteModalOpen(false);
        fetchMahasiswaList();
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.data ||
          error.message ||
          'Gagal menghapus mahasiswa';
        alert(`Error: ${errorMsg}`);
      }
    }
  };

  const handleViewDetail = (mahasiswa: Mahasiswa) => {
    setSelectedMahasiswa(mahasiswa);
    setIsDetailModalOpen(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'AKTIF':
        return 'success';
      case 'TIDAK_AKTIF':
        return 'danger';
      default:
        return 'info';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Manajemen Mahasiswa
          </h1>
          <p className="mt-2 text-gray-600">
            Kelola data mahasiswa perpustakaan
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={20} className="mr-2" />
          Tambah Mahasiswa
        </Button>
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Input
              placeholder="Cari nama, NIM, jurusan, atau alamat..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
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
                  { value: 'AKTIF', label: 'AKTIF' },
                  { value: 'TIDAK_AKTIF', label: 'TIDAK_AKTIF' },
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
                  { value: 'nama', label: 'Nama' },
                  { value: 'nim', label: 'NIM' },
                  { value: 'jurusan', label: 'Jurusan' },
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
                  { value: 'ASC', label: 'Menaik (A-Z)' },
                  { value: 'DESC', label: 'Menurun (Z-A)' },
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

      {/* Mahasiswa Table */}
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
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (sortBy === 'nama') {
                        setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                      } else {
                        setSortBy('nama');
                        setSortOrder('ASC');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Nama
                      {sortBy === 'nama' && (
                        <span className="text-blue-600">
                          {sortOrder === 'ASC' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (sortBy === 'nim') {
                        setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                      } else {
                        setSortBy('nim');
                        setSortOrder('ASC');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      NIM
                      {sortBy === 'nim' && (
                        <span className="text-blue-600">
                          {sortOrder === 'ASC' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (sortBy === 'jurusan') {
                        setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                      } else {
                        setSortBy('jurusan');
                        setSortOrder('ASC');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Jurusan
                      {sortBy === 'jurusan' && (
                        <span className="text-blue-600">
                          {sortOrder === 'ASC' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Alamat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    No. HP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mahasiswaList.length > 0 ? (
                  mahasiswaList.map((mahasiswa, index) => (
                    <tr key={mahasiswa.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {currentPage * 10 + index + 1}
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
                              onClick: () => handleViewDetail(mahasiswa),
                              icon: <Eye size={16} />,
                            },
                            {
                              label: 'Edit Data',
                              onClick: () => handleOpenModal(mahasiswa),
                              icon: <Pencil size={16} />,
                            },
                            {
                              label: 'Hapus Data',
                              onClick: () => {
                                setSelectedMahasiswa(mahasiswa);
                                setIsDeleteModalOpen(true);
                              },
                              variant: 'danger',
                              icon: <Trash2 size={16} />,
                            },
                          ]}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {mahasiswa.nama}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {mahasiswa.nim}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {mahasiswa.jurusan}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          {mahasiswa.alamat}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-400" />
                          {mahasiswa.phoneNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="info">
                          {(mahasiswa.role || '-').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={getStatusVariant(mahasiswa.status)}>
                          {mahasiswa.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No mahasiswa found
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
                Menampilkan <strong>{mahasiswaList.length}</strong> dari{' '}
                <strong>{totalItems}</strong> mahasiswa
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedMahasiswa ? 'Edit Mahasiswa' : 'Tambah Mahasiswa Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            required
          />

          <Input
            label="NIM"
            value={formData.nim}
            onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
            required
          />

          <Input
            label="Jurusan"
            value={formData.jurusan}
            onChange={(e) =>
              setFormData({ ...formData, jurusan: e.target.value })
            }
            required
          />

          <Input
            label="Alamat"
            value={formData.alamat}
            onChange={(e) =>
              setFormData({ ...formData, alamat: e.target.value })
            }
            required
          />

          <Input
            label="No. HP"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <Input
            label="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder={
              selectedMahasiswa
                ? 'Kosongkan jika tidak ingin mengubah password'
                : 'Masukkan password'
            }
            required={!selectedMahasiswa}
          />

          {selectedMahasiswa && (
            <Select
              label="Status"
              value={formData.status || 'AKTIF'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'AKTIF' | 'TIDAK_AKTIF',
                })
              }
              options={[
                { value: 'AKTIF', label: 'AKTIF' },
                { value: 'TIDAK_AKTIF', label: 'TIDAK_AKTIF' },
              ]}
              required
            />
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button type="submit">
              {selectedMahasiswa ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Mahasiswa"
      >
        {selectedMahasiswa && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nama Lengkap
                </label>
                <p className="text-gray-900 font-semibold">
                  {selectedMahasiswa.nama}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">NIM</label>
                <p className="text-gray-900 font-semibold">
                  {selectedMahasiswa.nim}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Jurusan
                </label>
                <p className="text-gray-900 font-semibold">
                  {selectedMahasiswa.jurusan}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  No. HP
                </label>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-900 font-semibold">
                    {selectedMahasiswa.phoneNumber}
                  </span>
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">
                  Alamat
                </label>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-900 font-semibold">
                    {selectedMahasiswa.alamat}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-gray-900 font-semibold">
                  {selectedMahasiswa.email || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Username
                </label>
                <p className="text-gray-900 font-semibold">
                  {selectedMahasiswa.username || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Role
                </label>
                <p className="text-gray-900 font-semibold">
                  {(selectedMahasiswa.role || '-').toUpperCase()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <div>
                  <Badge variant={getStatusVariant(selectedMahasiswa.status)}>
                    {selectedMahasiswa.status}
                  </Badge>
                </div>
              </div>
              {selectedMahasiswa.createdAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Dibuat Tanggal
                  </label>
                  <p className="text-gray-900">
                    {new Date(selectedMahasiswa.createdAt).toLocaleDateString(
                      'id-ID',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Mahasiswa"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus mahasiswa{' '}
            <strong>{selectedMahasiswa?.nama}</strong>?
          </p>
          <p className="text-sm text-orange-600">
            Peringatan: Semua data peminjaman terkait mahasiswa ini mungkin akan
            terpengaruh.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="button" variant="danger" onClick={handleDelete}>
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
