// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
  nama?: string;
  nim?: string;
  jurusan?: string;
  notelepon?: string;
  alamat?: string;
  tanggalBergabung?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nama: string;
  nim: string;
  jurusan: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Buku Types
export interface Buku {
  no?: number;
  id: string;
  judulBuku: string;
  penulis: string;
  penerbit: string;
  tahunTerbit: number;
  isbn?: string;
  kategoriId?: string;
  kategori?: KategoriBuku;
  jumlahSalinan: number;
  deskripsi?: string;
  statusBuku: {
    id: string;
    statusBuku: 'TERSEDIA' | 'DIPINJAM' | 'BOOKED';
  };
  namaKategoriBuku?: string;
  // Lokasi Rak - field terpisah sesuai database
  lantai?: string;
  ruang?: string;
  rak?: string;
  nomorRak?: string;
  nomorBaris?: string;
  // Field lama untuk backward compatibility
  lokasiRak?: string;
  createdAt?: string;
  updatedAt?: string;

  // Computed/aliased fields for compatibility
  judul?: string;
  pengarang?: string;
  stok?: number;
  status?: 'TERSEDIA' | 'DIPINJAM' | 'BOOKED';
}

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

// Kategori Buku Types
export interface KategoriBuku {
  id: string;
  nama: string;
  deskripsi?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateKategoriRequest {
  nama: string;
  deskripsi?: string;
}

export interface UpdateKategoriRequest {
  nama?: string;
  deskripsi?: string;
}

// Mahasiswa Types
export interface Mahasiswa {
  id: number;
  userId?: number;
  nama: string;
  nim: string;
  jurusan: string;
  alamat: string;
  phoneNumber: string;
  email?: string;
  username?: string;
  password?: string;
  role?: string; // Role dari user (ADMIN, USER, ANGGOTA, dll)
  status: 'AKTIF' | 'TIDAK_AKTIF';
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMahasiswaRequest {
  nama: string;
  nim: string;
  jurusan: string;
  alamat: string;
  phoneNumber: string;
  email: string;
  username: string;
  password: string;
}

export interface UpdateMahasiswaRequest {
  nama?: string;
  nim?: string;
  jurusan?: string;
  alamat?: string;
  phoneNumber?: string;
  status?: 'AKTIF' | 'TIDAK_AKTIF' | 'LULUS';
}

// Peminjaman Buku Types
export interface PeminjamanBuku {
  // ID fields (UUID)
  id?: string;
  bukuId?: string;
  userId?: string;
  mahasiswaId?: number;

  // Buku fields (dari response backend)
  judulBuku?: string;
  penulis?: string;
  penerbit?: string;
  tahunTerbit?: number;
  isbn?: string;
  namaKategori?: string;
  lokasiRak?: string;
  jumlahSalinan?: number;
  statusBukuTersedia?: string;

  // User/Mahasiswa fields (dari response backend)
  nama?: string;
  nim?: string;
  username?: string;
  email?: string;

  // Nested objects (backward compatibility)
  buku?: Buku;
  mahasiswa?: Mahasiswa;

  // Peminjaman dates
  tanggalPinjam: string;
  tanggalKembali?: string;
  tanggalHarusKembali?: string;
  statusBukuPinjaman?: string; // "DIPINJAM", "DIKEMBALIKAN", "TERLAMBAT", "DENDA", "MENUNGGU_PERSETUJUAN", dll

  // Legacy status field
  status?: 'DIPINJAM' | 'DIKEMBALIKAN' | 'TERLAMBAT' | 'DENDA' | 'MENUNGGU_PERSETUJUAN';
  denda?: number;
  catatan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePeminjamanRequest {
  bukuId: string; // UUID string from backend
  tanggalPinjam: string; // Format: YYYY-MM-DD
  tanggalKembali: string; // Format: YYYY-MM-DD
  statusBukuPinjaman: string; // "DIPINJAM"
  denda?: number; // Optional, default 0
}

export interface UpdatePeminjamanRequest {
  tanggalKembali?: string;
  status?: 'DIPINJAM' | 'DIKEMBALIKAN' | 'TERLAMBAT' | 'DENDA' | 'MENUNGGU_PERSETUJUAN';
  statusBukuPinjaman?: 'DIPINJAM' | 'DIKEMBALIKAN' | 'TERLAMBAT' | 'DENDA' | 'PENDING' | 'MENUNGGU_PERSETUJUAN';
  denda?: number;
  catatan?: string;
}

// Status Buku Types
export interface StatusBuku {
  bukuId: number;
  status: 'TERSEDIA' | 'DIPINJAM' | 'BOOKED';
  totalStok: number;
  stokTersedia: number;
  stokDipinjam: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
