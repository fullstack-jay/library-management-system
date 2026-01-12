import { User } from '@/types';

// Standard API Response format dari backend Java
export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthResponseData {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'ANGGOTA';
  token: string;

  // profil bisa null /optional
  nama: string;
  nim?: string;
  jurusan?: string;
}

// Convert backend response ke frontend User format
export function convertAuthResponseToUser(authData: AuthResponseData): {
  token: string;
  user: User;
} {
  const user: User = {
    id: authData.id,
    username: authData.username,
    email: authData.email,
    role: authData.role,
    nama: authData.nama,
    nim: authData.nim,
    jurusan: authData.jurusan,
  };

  return {
    token: authData.token,
    user,
  };
}

// Response lengkap dari login/pendaftaran endpoint
export interface AuthResponse extends ApiResponse<AuthResponseData> {}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface DashboardStatsResponse {
  totalBuku: number;
  totalMahasiswa: number;
  totalPeminjaman: number;
  bukuDipinjam: number;
}
