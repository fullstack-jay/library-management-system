export interface CreatePeminjamanRequest {
  bukuId: string;
  tanggalPinjam: string; // Format: YYYY-MM-DD
  tanggalKembali: string; // Format: YYYY-MM-DD
  statusBukuPinjaman: 'PENDING' | 'DIPINJAM' | 'DENDA' | 'SUDAH_DIKEMBALIKAN';
  denda?: number;
}

export interface UpdatePeminjamanRequest {
  tanggalKembali?: string;
  status?: 'PENDING' | 'DIPINJAM' | 'DENDA' | 'SUDAH_DIKEMBALIKAN';
  statusBukuPinjaman?: 'PENDING' | 'DIPINJAM' | 'DENDA' | 'SUDAH_DIKEMBALIKAN';
  denda?: number;
  catatan?: string;
}

export interface SearchPeminjamanRequest {
  sortColumn?: string;
  sortColumnDir?: 'ASC' | 'DESC';

  pageNumber?: number;
  pageSize?: number;
  status?: 'PENDING' | 'DIPINJAM' | 'DENDA' | 'SUDAH_DIKEMBALIKAN';
}
