/**
 * Status Buku Service
 * Menangani pengecekan status ketersediaan buku
 * Endpoint: /api/user/status-buku/*
 */

import { apiClient } from '../api-client';
import { BukuStatusResponse, ApiResponse } from '@/types';

export const statusBukuService = {
  /**
   * Get status buku
   * POST /api/user/status-buku/{id}
   */
  async getStatusBuku(bukuId: string): Promise<BukuStatusResponse> {
    try {
      if (
        !bukuId ||
        bukuId === '' ||
        bukuId === 'undefined' ||
        bukuId === 'null'
      ) {
        throw new Error('Invalid bukuId');
      }

      const response = await apiClient.post<ApiResponse<BukuStatusResponse>>(
        `/user/status-buku/${bukuId}`
      );

      // Handle ApiResponse wrapper
      if (response.status === 200 && response.data && response.data.data) {
        return response.data.data;
      } else {
        // Return default values if API fails
        return {
          bukuId: 0,
          status: 'TERSEDIA',
          totalStok: 0,
          stokTersedia: 0,
          stokDipinjam: 0,
        };
      }
    } catch (error: any) {
      // Return default values on error
      return {
        bukuId: 0,
        status: 'TERSEDIA',
        totalStok: 0,
        stokTersedia: 0,
        stokDipinjam: 0,
      };
    }
  },
};
