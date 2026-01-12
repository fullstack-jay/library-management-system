/**
 * Buku Service
 * Menangani operasi CRUD buku
 * Endpoint: /api/admin/buku/* dan /api/user/buku/*
 */

import { apiClient } from '../api-client';
import {
  CreateBukuRequest,
  UpdateBukuRequest,
  BukuFilterRequest,
} from '../viewmodels/requests/BukuRequest';
import { ApiResponse } from '../viewmodels/responses/ApiResponse';
import { Buku, PaginatedResponse } from '@/types';

export const bukuService = {
  // ===== ADMIN ENDPOINTS =====

  /**
   * Get all buku (Admin)
   * POST /api/admin/buku/find-all
   */
  async getAllBukuAdmin(
    filter: BukuFilterRequest
  ): Promise<PaginatedResponse<Buku>> {
    const response = await apiClient.post<ApiResponse<PaginatedResponse<Buku>>>(
      '/admin/buku/find-all',
      filter
    );

    if (
      response.status === 200 &&
      response.data.success &&
      response.data.data
    ) {
      return response.data.data;
    } else {
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
   * Create new buku (Admin)
   * POST /api/admin/buku/create
   */
  async createBuku(data: CreateBukuRequest): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/admin/buku/create',
      data
    );

    if (response.status !== 200 || !response.data.success) {
      throw new Error(response.data.message || 'Failed to create buku');
    }
  },

  /**
   * Update buku (Admin)
   * POST /api/admin/buku/edit (id in request body)
   */
  async updateBuku(data: UpdateBukuRequest): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/admin/buku/edit',
      data
    );

    if (response.status !== 200 || !response.data.success) {
      throw new Error(response.data.message || 'Failed to update buku');
    }
  },

  /**
   * Get buku by ID (Admin)
   * POST /api/admin/buku/find/:id
   */
  async getBukuByIdAdmin(id: string): Promise<Buku> {
    const response = await apiClient.post<ApiResponse<Buku>>(
      `/admin/buku/find/${id}`,
      {}
    );

    if (
      response.status === 200 &&
      response.data.success &&
      response.data.data
    ) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch buku');
    }
  },

  /**
   * Delete buku (Admin)
   * DELETE /api/admin/buku/:id
   */
  async deleteBuku(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/admin/buku/${id}`
    );

    if (response.status !== 200 || !response.data.success) {
      throw new Error(response.data.message || 'Failed to delete buku');
    }
  },

  // ===== USER ENDPOINTS =====

  /**
   * Get all buku (User/ANGGOTA)
   * POST /api/user/buku/find-all
   */
  async getAllBukuUser(
    filter: BukuFilterRequest
  ): Promise<PaginatedResponse<Buku>> {
    const response = await apiClient.post<ApiResponse<PaginatedResponse<Buku>>>(
      '/user/buku/find-all',
      filter
    );

    if (
      response.status === 200 &&
      response.data.success &&
      response.data.data
    ) {
      return response.data.data;
    } else {
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
   * Get buku by ID (User/ANGGOTA)
   * POST /api/user/buku/find/:id
   */
  async getBukuByIdUser(id: string): Promise<Buku> {
    const response = await apiClient.post<ApiResponse<Buku>>(
      `/user/buku/find/${id}`,
      {}
    );

    if (
      response.status === 200 &&
      response.data.success &&
      response.data.data
    ) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch buku');
    }
  },
};
