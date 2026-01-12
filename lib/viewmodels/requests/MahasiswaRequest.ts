export interface SearchMahasiswaRequest {
  // Sorting parameters
  sortColumn?: string;
  sortColumnDir?: 'ASC' | 'DESC';

  // Pagination parameters - backend uses 1-based page numbers
  pageNumber?: number;
  pageSize?: number;

  // Search parameters
  search?: string; // Global search in nama, nim, jurusan, alamat
  nama?: string;
  nim?: string;
  jurusan?: string;
  alamat?: string;
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
