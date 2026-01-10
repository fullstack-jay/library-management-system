/**
 * Buku Request ViewModels
 * Sesuaikan dengan backend Java BukuController
 */

export interface CreateBukuRequest {
  judulBuku: string;
  penulis: string;
  penerbit: string;
  tahunTerbit: number;
  isbn?: string;
  kategoriId?: string;
  jumlahSalinan: number;
  deskripsi?: string;
  // Lokasi Rak - field terpisah sesuai database
  lantai?: string;
  ruang?: string;
  rak?: string;
  nomorRak?: string;
  nomorBaris?: string;
  statusBuku?: string;
}

export interface UpdateBukuRequest {
  id: string;
  judulBuku?: string;
  penulis?: string;
  penerbit?: string;
  tahunTerbit?: number;
  isbn?: string;
  kategoriId?: string;
  jumlahSalinan?: number;
  deskripsi?: string;
  // Lokasi Rak - field terpisah sesuai database
  lantai?: string;
  ruang?: string;
  rak?: string;
  nomorRak?: string;
  nomorBaris?: string;
  statusBuku?: string;
}

export interface BukuFilterRequest {
  // Global search - search di judul, penulis, penerbit
  search?: string;
  // Individual search parameters - sesuai backend BukuSearchRequestRecord
  judulBuku?: string;
  penulis?: string;
  penerbit?: string;
  kategoriId?: string;
  status?: string;
  // Sorting parameters - sesuai backend BukuSearchRequestRecord
  sortColumn?: string;
  sortColumnDir?: 'ASC' | 'DESC';
  // Pagination parameters - sesuai backend BukuSearchRequestRecord
  pageNumber?: number;
  pageSize?: number;
}
