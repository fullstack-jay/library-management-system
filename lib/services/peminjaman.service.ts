/**
 * Peminjaman Service
 * Menangani operasi peminjaman buku
 * Endpoint: /api/admin/peminjaman/* dan /api/user/peminjaman/*
 */

import { apiClient } from '../api-client';
import {
  CreatePeminjamanRequest,
  UpdatePeminjamanRequest,
  SearchPeminjamanRequest,
} from '../viewmodels/requests/PeminjamanRequest';
import { ApiResponse } from '../viewmodels/responses/ApiResponse';
import { PeminjamanBuku, PaginatedResponse } from '@/types';

export const peminjamanService = {
  // ===== ADMIN ENDPOINTS =====

  /**
   * Get all peminjaman (Admin)
   * POST /api/admin/peminjaman/find-all
   */
  async getAllPeminjamanAdmin(params?: {
    page?: number;
    size?: number;
    status?: string;
    sortColumn?: string;
    sortColumnDir?: 'ASC' | 'DESC';
  }): Promise<PaginatedResponse<PeminjamanBuku>> {
    // Convert frontend 0-based page to backend 1-based page
    const backendParams: SearchPeminjamanRequest = {
      pageNumber: (params?.page ?? 0) + 1, // Convert to 1-based
      pageSize: params?.size ?? 10,
      status: params?.status as
        | 'PENDING'
        | 'DIPINJAM'
        | 'DENDA'
        | 'SUDAH_DIKEMBALIKAN',
      sortColumn: params?.sortColumn,
      sortColumnDir: params?.sortColumnDir,
    };

    const response = await apiClient.post<
      ApiResponse<PaginatedResponse<PeminjamanBuku>>
    >('/admin/peminjaman/find-all', backendParams);

    // Handle backend response format
    if (
      response.status === 200 &&
      response.data.success &&
      response.data.data
    ) {
      return response.data.data;
    } else {
      // Return empty paginated response if error
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0,
      };
    }
  },

  /**
   * Get peminjaman by ID (Admin)
   * POST /api/admin/peminjaman/{id}
   */
  async getPeminjamanByIdAdmin(id: string): Promise<PeminjamanBuku> {
    const response = await apiClient.post<ApiResponse<PeminjamanBuku>>(
      `/admin/peminjaman/${id}`,
      {}
    );

    if (
      response.status === 200 &&
      response.data.success &&
      response.data.data
    ) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch peminjaman');
    }
  },

  /**
   * Update peminjaman (Admin)
   * POST /api/admin/peminjaman/{id}/edit
   */
  async updatePeminjamanAdmin(
    id: string,
    data: UpdatePeminjamanRequest
  ): Promise<PeminjamanBuku> {
    const response = await apiClient.post<ApiResponse<PeminjamanBuku>>(
      `/admin/peminjaman/${id}/edit`,
      data
    );

    if (
      response.status === 200 &&
      response.data.success &&
      response.data.data
    ) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to update peminjaman');
    }
  },

  /**
   * Delete peminjaman (Admin)
   * DELETE /api/admin/peminjaman/{id}
   */
  async deletePeminjaman(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/admin/peminjaman/${id}`
    );

    if (response.status !== 200 || !response.data.success) {
      throw new Error(response.data.message || 'Failed to delete peminjaman');
    }
  },

  async getAllPeminjamanUser(params?: {
    pageNumber?: number;
    pageSize?: number;
    sortColumn?: string;
    sortColumnDir?: 'ASC' | 'DESC';
    search?: string;
    status?: string;
  }): Promise<PeminjamanBuku[]> {
    const requestBody = {
      sortColumn: params?.sortColumn ?? '',
      sortColumnDir: params?.sortColumnDir ?? 'ASC',
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 10,
      search: params?.search ?? '',
      status: params?.status ?? '',
    };

    try {
      const response = await apiClient.post<
        ApiResponse<PaginatedResponse<PeminjamanBuku>>
      >('/user/peminjaman/find-all', requestBody);

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
      // Return empty array on error instead of throwing
      return [];
    }
  },

  /**
   * Get peminjaman by ID (User)
   * POST /api/user/peminjaman/{id}
   */
  async getPeminjamanByIdUser(id: string): Promise<PeminjamanBuku> {
    const response = await apiClient.post<ApiResponse<PeminjamanBuku>>(
      `/user/peminjaman/${id}`,
      {}
    );

    if (
      response.status === 200 &&
      response.data.success &&
      response.data.data
    ) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || 'Failed to fetch peminjaman detail'
      );
    }
  },

  /**
   * Create new peminjaman (User)
   * POST /api/user/peminjaman
   *
   * Request:
   * {
   *   "bukuId": "uuid-buku",
   *   "tanggalPinjam": "2026-01-09",
   *   "tanggalKembali": "2026-01-23",
   *   "statusBukuPinjaman": "DIPINJAM"
   * }
   */
  async createPeminjaman(data: CreatePeminjamanRequest): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/user/peminjaman',
      data
    );

    if (response.status !== 200 || !response.data.success) {
      throw new Error(response.data.message || 'Failed to create peminjaman');
    }
  },

  /**
   * Request return buku (User) - Requires admin approval
   * POST /api/user/peminjaman/{id}/return
   */
  async requestReturnPeminjaman(id: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      `/user/peminjaman/${id}/return`,
      {}
    );

    if (response.status !== 200 || !response.data.success) {
      throw new Error(response.data.message || 'Failed to request return buku');
    }
  },

  /**
   * Return buku (User) - Direct return without approval
   * POST /api/user/peminjaman/{id}/return
   */
  async returnPeminjaman(id: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      `/user/peminjaman/${id}/return`,
      {}
    );

    if (response.status !== 200 || !response.data.success) {
      throw new Error(response.data.message || 'Failed to return buku');
    }
  },
};
