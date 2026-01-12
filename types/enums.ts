// Status peminjaman buku
export type StatusBukuPinjaman =
  | 'PENDING'
  | 'DIPINJAM'
  | 'DENDA'
  | 'SUDAH_DIKEMBALIKAN';

// Status buku (ketersediaan)
export type StatusBuku = 'TERSEDIA' | 'TIDAK_TERSEDIA';

// Status mahasiswa
export type StatusMahasiswa = 'AKTIF' | 'TIDAK_AKTIF';

// Role user
export type UserRole = 'ADMIN' | 'ANGGOTA';
