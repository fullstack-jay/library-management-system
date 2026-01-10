/**
 * Peminjaman Request ViewModels
 * Sesuaikan dengan backend Java PeminjamanBukuController
 */

export interface CreatePeminjamanRequest {
  bukuId: string; // UUID string from backend (id field)
  tanggalPinjam: string; // Format: YYYY-MM-DD
  tanggalKembali: string; // Format: YYYY-MM-DD
  statusBukuPinjaman: string; // "DIPINJAM"
  denda?: number; // Optional, default 0
}

export interface UpdatePeminjamanRequest {
  tanggalKembali?: string;
  status?: 'DIPINJAM' | 'DIKEMBALIKAN' | 'TERLAMBAT' | 'PENDING' | 'MENUNGGU_PERSETUJUAN';
  statusBukuPinjaman?: 'DIPINJAM' | 'DIKEMBALIKAN' | 'TERLAMBAT' | 'PENDING' | 'MENUNGGU_PERSETUJUAN';
  denda?: number;
  catatan?: string;
}

export interface SearchPeminjamanRequest {
  // Sorting parameters
  sortColumn?: string;
  sortColumnDir?: 'ASC' | 'DESC';

  // Pagination parameters - backend uses 1-based page numbers
  pageNumber?: number;
  pageSize?: number;

  // Search parameters
  status?: string; // Status filter: DIPINJAM, DIKEMBALIKAN, TERLAMBAT
}
