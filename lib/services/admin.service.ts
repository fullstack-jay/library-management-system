/**
 * Admin Service
 * Menangani operasi dashboard admin
 * Endpoint: /api/admin/*
 */

import { apiClient } from '../api-client';
import {
  ApiResponse,
  DashboardStatsResponse,
} from '../viewmodels/responses/ApiResponse';
import { PeminjamanBuku, PaginatedResponse } from '@/types';

export const adminService = {
  /**
   * Get Current Admin Profile
   * POST /api/admin/profile/me
   */
  async getProfile(): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        '/admin/profile/me',
        {}
      );

      if (
        response.status === 200 &&
        response.data.success &&
        response.data.data
      ) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch profile');
      }
    } catch (error: any) {
      throw error;
    }
  },

  async getDashboardStats(): Promise<DashboardStatsResponse> {
    try {
      const response = await apiClient.post<
        ApiResponse<DashboardStatsResponse>
      >('/dashboard/stats');

      if (
        response.status === 200 &&
        response.data.success &&
        response.data.data
      ) {
        return response.data.data;
      } else {
        // Return default values if API fails
        return {
          totalBuku: 0,
          totalMahasiswa: 0,
          totalPeminjaman: 0,
          bukuDipinjam: 0,
        };
      }
    } catch (error: any) {

      // Return default values on error
      return {
        totalBuku: 0,
        totalMahasiswa: 0,
        totalPeminjaman: 0,
        bukuDipinjam: 0,
      };
    }
  },

  /**
   * Get recent peminjaman
   * POST /api/admin/peminjaman/recent-peminjaman
   */
  async getRecentPeminjaman(
    sortColumn: string = 'nama',
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<PeminjamanBuku[]> {
    try {
      const requestBody = {
        sortColumn: sortColumn,
        sortColumnDir: sortOrder,
        pageNumber: 1,
        pageSize: 10,
      };

      const response = await apiClient.post<
        ApiResponse<PaginatedResponse<PeminjamanBuku>>
      >('/admin/peminjaman/recent-peminjaman', requestBody);

      if (
        response.status === 200 &&
        response.data.success &&
        response.data.data
      ) {
        const paginatedData = response.data.data;
        // Return content array from paginated response
        return paginatedData.content || [];
      } else {
        return [];
      }
    } catch (error: any) {
      // Return empty array on error
      return [];
    }
  },

  /**
   * Approve book return (Admin)
   * POST /api/admin/peminjaman/{id}/approve-return
   */
  async approveReturn(id: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        `/admin/peminjaman/${id}/approve-return`,
        {}
      );

      if (response.status !== 200 || !response.data.success) {
        throw new Error(response.data.message || 'Failed to approve return');
      }
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Check and update overdue peminjaman (Admin)
   * POST /api/admin/peminjaman/check-overdue
   * Automatically updates status to DENDA for books past the return date
   */
  async checkOverduePeminjaman(): Promise<{
    updated: number;
    message: string;
  }> {
    try {
      const response = await apiClient.post<
        ApiResponse<{ updated: number; message: string }>
      >('/admin/peminjaman/check-overdue', {});

      if (
        response.status === 200 &&
        response.data.success &&
        response.data.data
      ) {
        const result = response.data.data;
        return result;
      } else {
        return {
          updated: 0,
          message: response.data.message || 'Failed to check overdue',
        };
      }
    } catch (error: any) {
      // Return default result on error
      return {
        updated: 0,
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to check overdue peminjaman',
      };
    }
  },

  /**
   * Upload Admin Profile Photo
   * POST /api/admin/profile/upload
   */
  async uploadProfilePhoto(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<ApiResponse<string>>(
        '/admin/profile/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (
        response.status === 200 &&
        response.data.success &&
        response.data.data
      ) {
        return response.data.data; // URL foto yang diupload
      } else {
        throw new Error(response.data.message || 'Failed to upload photo');
      }
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Update Admin Profile
   * POST /api/admin/profile/update
   */
  async updateProfile(data: {
    id: string;
    nama: string;
    email: string;
  }): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/admin/profile/update',
        data
      );

      if (response.status === 200 && response.data.success) {
        return;
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Change Admin Password
   * POST /api/admin/change-password
   */
  async changePassword(data: {
    id: string;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/admin/change-password',
        data
      );

      if (response.status === 200 && response.data.success) {
        return;
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error: any) {
      throw error;
    }
  },
};
