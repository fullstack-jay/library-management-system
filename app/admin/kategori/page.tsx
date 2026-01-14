'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { kategoriService } from '@/lib/services';
import {
  KategoriBuku,
  CreateKategoriRequest,
  UpdateKategoriRequest,
} from '@/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminKategoriPage() {
  const [kategoriList, setKategoriList] = useState<KategoriBuku[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<KategoriBuku | null>(
    null
  );
  const [formData, setFormData] = useState<CreateKategoriRequest>({
    nama: '',
    deskripsi: '',
  });

  useEffect(() => {
    fetchKategoriList();
  }, []);

  const fetchKategoriList = async () => {
    try {
      setIsLoading(true);
      const response = await kategoriService.getAllKategori();
      setKategoriList(response);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (kategori?: KategoriBuku) => {
    if (kategori) {
      setSelectedKategori(kategori);
      setFormData({
        nama: kategori.nama,
        deskripsi: kategori.deskripsi || '',
      });
    } else {
      setSelectedKategori(null);
      setFormData({
        nama: '',
        deskripsi: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedKategori(null);
    setFormData({
      nama: '',
      deskripsi: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate nama is not empty
    if (!formData.nama || formData.nama.trim() === '') {
      alert('Nama kategori tidak boleh kosong!');
      return;
    }

    try {
      if (selectedKategori) {
        // Update existing kategori - ensure id is valid and nama is provided
        const updateData: UpdateKategoriRequest = {
          id: selectedKategori.id || '',
          nama: formData.nama.trim(),
          deskripsi: formData.deskripsi?.trim() || '',
        };
        await kategoriService.updateKategori(updateData);
      } else {
        // Create new kategori
        const createData: CreateKategoriRequest = {
          nama: formData.nama.trim(),
          deskripsi: formData.deskripsi?.trim() || '',
        };
        await kategoriService.createKategori(createData);
      }
      handleCloseModal();
      fetchKategoriList();
    } catch (error) {
    }
  };

  const handleDelete = async () => {
    if (selectedKategori) {
      try {
        await kategoriService.deleteKategori(selectedKategori.id);
        setIsDeleteModalOpen(false);
        fetchKategoriList();
      } catch (error) {}
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Manajemen Kategori
          </h1>
          <p className="mt-2 text-gray-600">
            Kelola kategori buku perpustakaan
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={20} className="mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {/* Kategori Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-600">Loading...</div>
          </div>
        ) : kategoriList.length > 0 ? (
          kategoriList.map((kategori) => (
            <Card
              key={kategori.id}
              className="hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="mb-3">
                    <p className="inline-block px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded uppercase">
                      Nama Kategori
                    </p>
                    <h3 className="text-lg font-semibold text-gray-900 mt-2">
                      {kategori.nama}
                    </h3>
                  </div>
                  {kategori.deskripsi && (
                    <div>
                      <p className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded uppercase">
                        Deskripsi
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        "{kategori.deskripsi}"
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenModal(kategori)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setSelectedKategori(kategori);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <div className="text-center py-8 text-gray-500">
              No kategori found. Create one to get started.
            </div>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedKategori ? 'Edit Kategori' : 'Tambah Kategori Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Kategori"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            required
            placeholder="Contoh: Fiksi, Sains, Sejarah"
          />

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
              placeholder="Deskripsi kategori buku (opsional)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button type="submit">
              {selectedKategori ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Kategori"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus kategori{' '}
            <strong>{selectedKategori?.nama}</strong>?
          </p>
          <p className="text-sm text-orange-600">
            Peringatan: Semua buku dalam kategori ini mungkin akan terpengaruh.
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
