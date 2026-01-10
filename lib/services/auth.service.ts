/**
 * Auth Service
 * Menangani semua operasi autentikasi
 * Endpoint: /api/auth/*
 * Backend: AuthController.java
 */

import { apiClient } from '../api-client';
import {
  LoginRequest,
  RegisterRequest,
} from '../viewmodels/requests/AuthRequest';
import {
  ApiResponse,
  AuthResponseData,
  convertAuthResponseToUser,
} from '../viewmodels/responses/ApiResponse';

// Return type untuk login (sesuai frontend expectation)
interface LoginResult {
  token: string;
  user: any;
}

export const authService = {
  /**
   * Login user
   * POST /api/auth/login
   *
   * Backend response format:
   * {
   *   "status": 200,
   *   "success": true,
   *   "message": "Berhasil Login",
   *   "data": {
   *     "role": "ANGGOTA",
   *     "nama": "...",
   *     "id": "...",
   *     "email": "...",
   *     "token": "jwt_token_here",
   *     "username": "...",
   *     "nim": "...",
   *     "jurusan": "..."
   *   }
   * }
   */
  async login(data: LoginRequest): Promise<LoginResult> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>(
        '/auth/login',
        data
      );

      // Check if response is successful
      if (
        response.status === 200 &&
        response.data.success &&
        response.data.data
      ) {
        // Convert backend format to frontend format
        const authData = response.data.data;
        const result = convertAuthResponseToUser(authData);

        return result;
      } else {
        // Handle unsuccessful response from backend
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      // Handle axios errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.data) {
        throw new Error(error.response.data.data);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  },

  /**
   * Register new user (Mahasiswa)
   * POST /api/auth/register
   */
  async register(data: RegisterRequest): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/auth/register',
        data
      );

      if (response.status === 200 && response.data.success) {
        return;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  /**
   * Logout user
   * GET /api/auth/logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.get('/auth/logout');
    } catch (error: any) {
      // Logout tetap dilakukan di frontend
    }
  },
};
