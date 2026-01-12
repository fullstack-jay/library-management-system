import type {
  UserRole,
  StatusMahasiswa,
  StatusBukuPinjaman,
  StatusBuku,
} from './enums';

export type {
  UserRole,
  StatusMahasiswa,
  StatusBukuPinjaman,
  StatusBuku,
};

/* =========================
   USER
========================= */
export interface User {
  id: number | string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;

  nama?: string;
  nim?: string;
  jurusan?: string;
  notelepon?: string;
  alamat?: string;
  fotoProfile?: string;
  status?: UserRole;

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

/* =========================
   KATEGORI BUKU
========================= */
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
  id: string;
  nama: string;
  deskripsi?: string;
}

/* =========================
   BUKU
========================= */
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
    statusBuku: StatusBuku;
  };

  // Lokasi Rak
  lantai?: string;
  ruang?: string;
  rak?: string;
  nomorRak?: string;
  nomorBaris?: string;

  createdAt?: string;
  updatedAt?: string;

  // backward compatibility
  judul?: string;
  pengarang?: string;
  stok?: number;
  namaKategoriBuku?: string;
  lokasiRak?: string;
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

  lantai?: string;
  ruang?: string;
  rak?: string;
  nomorRak?: string;
  nomorBaris?: string;

  statusBuku?: StatusBuku;
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

  lantai?: string;
  ruang?: string;
  rak?: string;
  nomorRak?: string;
  nomorBaris?: string;

  statusBuku?: StatusBuku;
}

export interface StatusStokBuku {
  bukuId: string;
  stokTersedia: number;
  stokDipinjam: number;
  totalStok: number;
}

/* =========================
   MAHASISWA
========================= */
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

  status: StatusMahasiswa;
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
  status?: StatusMahasiswa;
}

/* =========================
   PEMINJAMAN BUKU
========================= */
export interface PeminjamanBuku {
  id?: string;
  bukuId?: string;
  userId?: string;
  mahasiswaId?: number;

  judulBuku?: string;
  penulis?: string;
  penerbit?: string;
  tahunTerbit?: number;
  isbn?: string;

  nama?: string;
  nim?: string;
  username?: string;
  email?: string;

  buku?: Buku;
  mahasiswa?: Mahasiswa;

  tanggalPinjam: string;
  tanggalKembali?: string;
  tanggalHarusKembali?: string;

  // 🔥 SESUAI StatusBukuPinjaman.java
  statusBukuPinjaman?: StatusBukuPinjaman;

  // backward compatibility
  status?: StatusBukuPinjaman;

  denda?: number;
  catatan?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePeminjamanRequest {
  bukuId: string;
  tanggalPinjam: string;
  tanggalKembali: string;
  statusBukuPinjaman: StatusBukuPinjaman;
  denda?: number;
}

export interface UpdatePeminjamanRequest {
  tanggalKembali?: string;
  status?: StatusBukuPinjaman;
  statusBukuPinjaman?: StatusBukuPinjaman;
  denda?: number;
  catatan?: string;
}

// Status Buku Response (with stock information)
export interface BukuStatusResponse {
  bukuId: number;
  status: StatusBuku;
  totalStok: number;
  stokTersedia: number;
  stokDipinjam: number;
}

/* =========================
   API RESPONSE
========================= */
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
