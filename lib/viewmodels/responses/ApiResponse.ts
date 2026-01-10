/**
 * API Response ViewModels
 * Sesuaikan dengan response dari backend Java
 * BaseResponse<T> structure:
 * {
 *   "status": 200,
 *   "success": true,
 *   "message": "Berhasil Login",
 *   "data": T
 * }
 */

import {
  User,
  Buku,
  KategoriBuku,
  Mahasiswa,
  PeminjamanBuku,
  StatusBuku,
} from '@/types';

// Standard API Response format dari backend Java
export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data?: T;
}

// Auth response - Backend mengembalikan user dengan token embedded
// Format actual dari backend:
// {
//   "data": {
//     "role": "ANGGOTA" | "ADMIN",
//     "nama": "...",
//     "id": "...",
//     "email": "...",
//     "token": "jwt_token_here",  <- Token embedded di user object
//     "username": "...",
//     "nim": "...",
//     "jurusan": "..."
//   }
// }
export interface AuthResponseData {
  role: 'ADMIN' | 'ANGGOTA';
  nama: string;
  id: string;
  email: string;
  token: string;
  username: string;
  nim?: string;
  jurusan?: string;
}

// Convert backend response ke frontend User format
export function convertAuthResponseToUser(authData: AuthResponseData): {
  token: string;
  user: User;
} {
  // Mapping role "ANGGOTA" -> "USER"
  const role = authData.role === 'ANGGOTA' ? 'USER' : authData.role;

  const user: User = {
    id: parseInt(authData.id) || Number(authData.id), // Handle UUID string
    username: authData.username,
    email: authData.email,
    role: role as 'ADMIN' | 'USER',
    nama: authData.nama,
    nim: authData.nim,
    jurusan: authData.jurusan,
  };

  return {
    token: authData.token,
    user: user,
  };
}

// Response lengkap dari login/register endpoint
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
