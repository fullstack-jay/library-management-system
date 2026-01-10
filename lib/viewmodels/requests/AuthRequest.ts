/**
 * Auth Request ViewModels
 * Sesuaikan dengan backend Java AuthController
 */

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
