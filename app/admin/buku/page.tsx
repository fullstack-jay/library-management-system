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
import { bukuService, kategoriService } from '@/lib/services';
import {
  Buku,
  KategoriBuku,
  CreateBukuRequest,
  UpdateBukuRequest,
} from '@/types';
import { Plus, Pencil, Trash2, Search, Eye, MoreVertical } from 'lucide-react';

export default function AdminBukuPage() {
  const [bukuList, setBukuList] = useState<Buku[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriBuku[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBuku, setSelectedBuku] = useState<Buku | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState('judulBuku');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [formData, setFormData] = useState<CreateBukuRequest>({
    judulBuku: '',
    penulis: '',
    penerbit: '',
    tahunTerbit: new Date().getFullYear(),
    isbn: '',
    kategoriId: '',
    jumlahSalinan: 0,
    deskripsi: '',
    statusBuku: 'TIDAK_TERSEDIA', // Default: stok 0 = tidak tersedia
  });

  // State untuk lokasi rak terpisah
  const [lokasiRakParts, setLokasiRakParts] = useState({
    lantai: '',
    ruang: '',
    rak: '',
    nomorRak: '',
    nomorBaris: '',
  });

  // Update status otomatis berdasarkan jumlah salinan
  useEffect(() => {
    if (formData.jumlahSalinan > 0) {
      setFormData((prev) => ({
        ...prev,
        statusBuku: 'TERSEDIA',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        statusBuku: 'TIDAK_TERSEDIA',
      }));
    }
  }, [formData.jumlahSalinan]);

  // Update field lokasi rak di formData berdasarkan parts
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      lantai: lokasiRakParts.lantai || undefined,
      ruang: lokasiRakParts.ruang || undefined,
      rak: lokasiRakParts.rak || undefined,
      nomorRak: lokasiRakParts.nomorRak || undefined,
      nomorBaris: lokasiRakParts.nomorBaris || undefined,
    }));
  }, [lokasiRakParts]);

  useEffect(() => {
    fetchBukuList();
    fetchKategoriList();
  }, [currentPage, searchTerm, kategoriFilter, sortBy, sortOrder]);

  const fetchBukuList = async () => {
    try {
      setIsLoading(true);
      const response = await bukuService.getAllBukuAdmin({
        // Pagination - backend menggunakan pageNumber mulai dari 1
        pageNumber: currentPage + 1, // Frontend 0-based, backend 1-based
        pageSize: 10,
        // Global search - backend akan mencari di judul, penulis, penerbit
        search: searchTerm || undefined,
        kategoriId: kategoriFilter || undefined,
        sortColumn: sortBy,
        sortColumnDir: sortOrder,
      });
      setBukuList(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalItems(response.totalElements || 0);
    } catch (error) {
      setBukuList([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKategoriList = async () => {
    try {
      const response = await kategoriService.getAllKategori();
      setKategoriList(response);
    } catch (error) {
      setKategoriList([]);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0); // Reset ke halaman 1 saat search berubah
  };

  const handleOpenModal = (buku?: Buku) => {
    if (buku) {
      setSelectedBuku(buku);

      // Cari kategoriId berdasarkan nama kategori
      let kategoriId = buku.kategoriId || '';
      if (!kategoriId && buku.namaKategoriBuku && kategoriList.length > 0) {
        const kategori = kategoriList.find(
          (k) => k.nama === buku.namaKategoriBuku
        );
        if (kategori) {
          kategoriId = kategori.id;
        }
      }

      // Ambil lokasi rak dari field terpisah backend atau parse dari lokasiRak (backward compatibility)
      const lokasiParts = {
        lantai: buku.lantai || '',
        ruang: buku.ruang || '',
        rak: buku.rak || '',
        nomorRak: buku.nomorRak || '',
        nomorBaris: buku.nomorBaris || '',
      };

      // Jika backend masih mengirim lokasiRak string, parse ke parts
      if ((!lokasiParts.lantai || !lokasiParts.ruang) && buku.lokasiRak) {
        const parsedParts = buku.lokasiRak.split(' - ').reduce(
          (acc, part, index) => {
            const keys = [
              'lantai',
              'ruang',
              'rak',
              'nomorRak',
              'nomorBaris',
            ] as const;
            if (index < keys.length && part.trim()) {
              acc[keys[index]] = part.trim();
            }
            return acc;
          },
          { lantai: '', ruang: '', rak: '', nomorRak: '', nomorBaris: '' }
        );
        Object.assign(lokasiParts, parsedParts);
      }

      setLokasiRakParts(lokasiParts);

      setFormData({
        judulBuku: buku.judulBuku,
        penulis: buku.penulis,
        penerbit: buku.penerbit,
        tahunTerbit: buku.tahunTerbit,
        isbn: buku.isbn,
        kategoriId: kategoriId,
        jumlahSalinan: buku.jumlahSalinan,
        deskripsi: buku.deskripsi,
        // Lokasi Rak field terpisah
        lantai: lokasiParts.lantai || undefined,
        ruang: lokasiParts.ruang || undefined,
        rak: lokasiParts.rak || undefined,
        nomorRak: lokasiParts.nomorRak || undefined,
        nomorBaris: lokasiParts.nomorBaris || undefined,
        // Status akan diupdate otomatis oleh useEffect berdasarkan jumlahSalinan
        statusBuku: buku.jumlahSalinan > 0 ? 'TERSEDIA' : 'TIDAK_TERSEDIA',
      });
    } else {
      setSelectedBuku(null);
      setLokasiRakParts({
        lantai: '',
        ruang: '',
        rak: '',
        nomorRak: '',
        nomorBaris: '',
      });
      setFormData({
        judulBuku: '',
        penulis: '',
        penerbit: '',
        tahunTerbit: new Date().getFullYear(),
        isbn: '',
        kategoriId: '',
        jumlahSalinan: 0,
        deskripsi: '',
        statusBuku: 'TIDAK_TERSEDIA', // Default: stok 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBuku(null);
    setLokasiRakParts({
      lantai: '',
      ruang: '',
      rak: '',
      nomorRak: '',
      nomorBaris: '',
    });
    setFormData({
      judulBuku: '',
      penulis: '',
      penerbit: '',
      tahunTerbit: new Date().getFullYear(),
      isbn: '',
      kategoriId: '',
      jumlahSalinan: 0,
      deskripsi: '',
      statusBuku: 'TIDAK_TERSEDIA',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedBuku) {
        // Update existing buku - id is now in request body
        await bukuService.updateBuku({
          id: selectedBuku.id,
          ...formData,
        });
      } else {
        // Create new buku
        await bukuService.createBuku(formData);
      }
      handleCloseModal();
      fetchBukuList();
    } catch (error) {
    }
  };

  const handleDelete = async () => {
    if (selectedBuku) {
      try {
        // Delete buku
        await bukuService.deleteBuku(selectedBuku.id);
        setIsDeleteModalOpen(false);
        fetchBukuList();
      } catch (error) {
      }
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
      case 'TIDAK_TERSEDIA':
        return 'secondary'; // Gray untuk tidak tersedia
      default:
        return 'info';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Buku</h1>
          <p className="mt-2 text-gray-600">Kelola data buku perpustakaan</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={20} className="mr-2" />
          Tambah Buku
        </Button>
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Input
              placeholder="Cari judul, penulis, penerbit, atau ISBN..."
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
            {/* Filter Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter Kategori
              </label>
              <Select
                value={kategoriFilter}
                onChange={(e) => setKategoriFilter(e.target.value)}
                options={[
                  { value: '', label: 'Semua Kategori' },
                  ...kategoriList.map((k) => ({ value: k.id, label: k.nama })),
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
                  { value: 'judulBuku', label: 'Judul Buku' },
                  { value: 'penulis', label: 'Penulis' },
                  { value: 'penerbit', label: 'Penerbit' },
                  { value: 'tahunTerbit', label: 'Tahun Terbit' },
                  { value: 'jumlahSalinan', label: 'Stok' },
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
          {(searchTerm || kategoriFilter) && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setKategoriFilter('');
                  setCurrentPage(0);
                }}
              >
                Reset Semua Filter
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Buku Table */}
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
                      if (sortBy === 'judulBuku') {
                        setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                      } else {
                        setSortBy('judulBuku');
                        setSortOrder('ASC');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Judul
                      {sortBy === 'judulBuku' && (
                        <span className="text-blue-600">
                          {sortOrder === 'ASC' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (sortBy === 'penulis') {
                        setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                      } else {
                        setSortBy('penulis');
                        setSortOrder('ASC');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Penulis
                      {sortBy === 'penulis' && (
                        <span className="text-blue-600">
                          {sortOrder === 'ASC' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Penerbit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ISBN
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kategori
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Lokasi Rak
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      if (sortBy === 'jumlahSalinan') {
                        setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                      } else {
                        setSortBy('jumlahSalinan');
                        setSortOrder('ASC');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Stok
                      {sortBy === 'jumlahSalinan' && (
                        <span className="text-blue-600">
                          {sortOrder === 'ASC' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bukuList.length > 0 ? (
                  bukuList.map((buku) => (
                    <tr key={buku.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {buku.no || '-'}
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
                              onClick: () => {
                                setSelectedBuku(buku);
                                setIsDetailModalOpen(true);
                              },
                              icon: <Eye size={16} />,
                            },
                            {
                              label: 'Edit Data',
                              onClick: () => handleOpenModal(buku),
                              icon: <Pencil size={16} />,
                            },
                            {
                              label: 'Hapus Data',
                              onClick: () => {
                                setSelectedBuku(buku);
                                setIsDeleteModalOpen(true);
                              },
                              variant: 'danger',
                              icon: <Trash2 size={16} />,
                            },
                          ]}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {buku.judulBuku}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {buku.penulis}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {buku.penerbit}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {buku.isbn || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {buku.namaKategoriBuku || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {(() => {
                          // Tampilkan lokasi rak dari field terpisah atau dari lokasiRak string (backward compatibility)
                          if (
                            buku.lantai ||
                            buku.ruang ||
                            buku.rak ||
                            buku.nomorRak ||
                            buku.nomorBaris
                          ) {
                            const parts = [
                              buku.lantai,
                              buku.ruang,
                              buku.rak,
                              buku.nomorRak,
                              buku.nomorBaris,
                            ].filter(Boolean);
                            return parts.join(' - ') || '-';
                          }
                          return buku.lokasiRak || '-';
                        })()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {buku.jumlahSalinan}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge
                          variant={getStatusVariant(
                            buku.statusBuku?.statusBuku
                          )}
                        >
                          {buku.statusBuku?.statusBuku}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No buku found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination & Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          {/* Info Items */}
          <div className="text-sm text-gray-600">
            {totalItems > 0 && (
              <span>
                Menampilkan <strong>{bukuList.length}</strong> dari{' '}
                <strong>{totalItems}</strong> buku
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
        title={selectedBuku ? 'Edit Buku' : 'Tambah Buku Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Judul Buku"
            value={formData.judulBuku}
            onChange={(e) =>
              setFormData({ ...formData, judulBuku: e.target.value })
            }
            required
          />

          <Input
            label="Penulis"
            value={formData.penulis}
            onChange={(e) =>
              setFormData({ ...formData, penulis: e.target.value })
            }
            required
          />

          <Input
            label="Penerbit"
            value={formData.penerbit}
            onChange={(e) =>
              setFormData({ ...formData, penerbit: e.target.value })
            }
            required
          />

          <Input
            label="Tahun Terbit"
            type="number"
            value={formData.tahunTerbit}
            onChange={(e) =>
              setFormData({
                ...formData,
                tahunTerbit: parseInt(e.target.value),
              })
            }
            required
          />

          <Input
            label="ISBN"
            value={formData.isbn}
            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
          />

          <Select
            label="Kategori"
            value={formData.kategoriId}
            onChange={(e) =>
              setFormData({ ...formData, kategoriId: e.target.value })
            }
            options={[
              { value: '', label: 'Pilih Kategori' },
              ...kategoriList.map((k) => ({ value: k.id, label: k.nama })),
            ]}
          />

          <Input
            label="Jumlah Salinan"
            type="number"
            value={formData.jumlahSalinan === 0 ? '' : formData.jumlahSalinan}
            onChange={(e) =>
              setFormData({
                ...formData,
                jumlahSalinan:
                  e.target.value === '' ? 0 : parseInt(e.target.value),
              })
            }
            required
            className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
            placeholder="0"
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi Rak
            </label>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-5 gap-2">
                <Input
                  label="Lantai"
                  placeholder="1"
                  value={lokasiRakParts.lantai}
                  onChange={(e) =>
                    setLokasiRakParts({
                      ...lokasiRakParts,
                      lantai: e.target.value,
                    })
                  }
                />
                <Input
                  label="Zona"
                  placeholder="A"
                  value={lokasiRakParts.ruang}
                  onChange={(e) =>
                    setLokasiRakParts({
                      ...lokasiRakParts,
                      ruang: e.target.value,
                    })
                  }
                />
                <Input
                  label="Rak"
                  placeholder="01"
                  value={lokasiRakParts.rak}
                  onChange={(e) =>
                    setLokasiRakParts({
                      ...lokasiRakParts,
                      rak: e.target.value,
                    })
                  }
                />
                <Input
                  label="Nomor Rak"
                  placeholder="05"
                  value={lokasiRakParts.nomorRak}
                  onChange={(e) =>
                    setLokasiRakParts({
                      ...lokasiRakParts,
                      nomorRak: e.target.value,
                    })
                  }
                />
                <Input
                  label="Nomor Baris"
                  placeholder="02"
                  value={lokasiRakParts.nomorBaris}
                  onChange={(e) =>
                    setLokasiRakParts({
                      ...lokasiRakParts,
                      nomorBaris: e.target.value,
                    })
                  }
                />
              </div>
              <p className="text-xs text-blue-600 mt-3">
                Preview:{' '}
                <strong>
                  {lokasiRakParts.lantai ||
                  lokasiRakParts.ruang ||
                  lokasiRakParts.rak ||
                  lokasiRakParts.nomorRak ||
                  lokasiRakParts.nomorBaris
                    ? [
                        lokasiRakParts.lantai,
                        lokasiRakParts.ruang,
                        lokasiRakParts.rak,
                        lokasiRakParts.nomorRak,
                        lokasiRakParts.nomorBaris,
                      ]
                        .filter((part) => part.trim() !== '')
                        .join(' - ')
                    : '-'}
                </strong>
              </p>
            </div>
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData({ ...formData, deskripsi: e.target.value })
              }
              placeholder="Deskripsi buku..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button type="submit">{selectedBuku ? 'Update' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Buku"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus buku{' '}
            <strong>{selectedBuku?.judulBuku}</strong>?
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

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Buku"
      >
        {selectedBuku && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Judul Buku
                </label>
                <p className="text-gray-900 font-semibold">
                  {selectedBuku.judulBuku}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Penulis
                </label>
                <p className="text-gray-900">{selectedBuku.penulis}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Penerbit
                </label>
                <p className="text-gray-900">{selectedBuku.penerbit}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Tahun Terbit
                </label>
                <p className="text-gray-900">{selectedBuku.tahunTerbit}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  ISBN
                </label>
                <p className="text-gray-900">{selectedBuku.isbn || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Kategori
                </label>
                <p className="text-gray-900">
                  {selectedBuku.namaKategoriBuku || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Lokasi Rak
                </label>
                {(() => {
                  if (
                    selectedBuku.lantai ||
                    selectedBuku.ruang ||
                    selectedBuku.rak ||
                    selectedBuku.nomorRak ||
                    selectedBuku.nomorBaris
                  ) {
                    return (
                      <div className="mt-2 bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-blue-600 font-bold text-sm">
                                1
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs block">
                                Lantai
                              </span>
                              <span className="font-semibold text-gray-900">
                                {selectedBuku.lantai || '-'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-green-600 font-bold text-sm">
                                2
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs block">
                                Ruang
                              </span>
                              <span className="font-semibold text-gray-900">
                                {selectedBuku.ruang || '-'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-purple-600 font-bold text-sm">
                                3
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs block">
                                Nomor Rak
                              </span>
                              <span className="font-semibold text-gray-900">
                                {selectedBuku.nomorRak || '-'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-orange-600 font-bold text-sm">
                                4
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-xs block">
                                Nomor Tingkat
                              </span>
                              <span className="font-semibold text-gray-900">
                                {selectedBuku.nomorBaris || '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <p className="text-gray-900 mt-1">
                      {selectedBuku.lokasiRak || '-'}
                    </p>
                  );
                })()}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Jumlah Salinan
                </label>
                <p className="text-gray-900">{selectedBuku.jumlahSalinan}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <div className="mt-1">
                  <Badge
                    variant={getStatusVariant(
                      selectedBuku.statusBuku?.statusBuku
                    )}
                  >
                    {selectedBuku.statusBuku?.statusBuku}
                  </Badge>
                </div>
              </div>
            </div>
            {selectedBuku.deskripsi && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Deskripsi
                </label>
                <p className="text-gray-900 mt-1">{selectedBuku.deskripsi}</p>
              </div>
            )}
            <div className="flex justify-end pt-4">
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
    </div>
  );
}
