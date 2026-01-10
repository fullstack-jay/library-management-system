/**
 * Kategori Request ViewModels
 * Sesuaikan dengan backend Java KategoriBukuController
 */

export interface CreateKategoriRequest {
  nama: string;
  deskripsi?: string;
}

export interface UpdateKategoriRequest {
  id: string;
  nama?: string;
  deskripsi?: string;
}

export interface KategoriBukuFilterRequest {
  search?: string;
  nama?: string;
}
