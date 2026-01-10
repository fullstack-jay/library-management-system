/**
 * Mahasiswa Request ViewModels
 * Sesuaikan dengan backend Java SearchMahasiswaRequestRecord & CreateMahasiswaRequestRecord
 */

export interface SearchMahasiswaRequest {
  // Sorting parameters
  sortColumn?: string;
  sortColumnDir?: 'ASC' | 'DESC';

  // Pagination parameters - backend uses 1-based page numbers
  pageNumber?: number;
  pageSize?: number;

  // Search parameters
  search?: string; // Global search in nama, nim, jurusan, alamat
  nama?: string; // Search by nama only
  nim?: string; // Search by nim only
  jurusan?: string; // Search by jurusan only
  alamat?: string; // Search by alamat only
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
  email?: string;
  username?: string;
  password?: string;
  status?: 'AKTIF' | 'TIDAK_AKTIF';
}
