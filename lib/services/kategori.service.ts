/**
 * Kategori Service
 * Menangani operasi CRUD kategori buku
 * Endpoint: /api/admin/kategori/* dan /api/user/kategori/*
 */

import { apiClient } from '../api-client';
import { CreateKategoriRequest, UpdateKategoriRequest, KategoriBukuFilterRequest } from '../viewmodels/requests/KategoriRequest';
import { ApiResponse } from '../viewmodels/responses/ApiResponse';
import { KategoriBuku, PaginatedResponse } from '@/types';

export const kategoriService = {
  // ===== USER ENDPOINTS =====

  /**
   * Get all kategori (User/Public)
   * GET /api/user/kategori or fallback to public endpoints
   */
  async getAllKategoriUser(): Promise<KategoriBuku[]> {

    // Try user endpoint first
    try {
      const response = await apiClient.get<ApiResponse<KategoriBuku[]>>('/user/kategori');


      // Handle backend response format
      if (response.status === 200 && response.data.success && response.data.data) {
        return response.data.data;
      }
    } catch (error: any) {
    }

    // Fallback: Try admin endpoint (might work if backend doesn't have strict auth)
    try {
      const response = await apiClient.get<ApiResponse<KategoriBuku[]>>('/admin/kategori');

      if (response.status === 200 && response.data.success && response.data.data) {
        return response.data.data;
      }
    } catch (error: any) {
    }

    // Fallback: Try the enum labels endpoint
    try {
      const response = await apiClient.get<string[]>('/admin/kategori/get-all');

      if (response.status === 200 && response.data) {

        // Convert string array to KategoriBuku objects
        return response.data.map((nama, index) => ({
          id: String(index + 1),
          nama: nama,
          deskripsi: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      }
    } catch (error: any) {
    }

    // All attempts failed - return empty array
    return [];
  },

  // ===== ADMIN ENDPOINTS =====

  /**
   * Get all kategori (Admin)
   * GET /api/admin/kategori
   */
  async getAllKategori(): Promise<KategoriBuku[]> {
    const response = await apiClient.get<ApiResponse<KategoriBuku[]>>('/admin/kategori');

    // Handle backend response format
    if (response.status === 200 && response.data.success && response.data.data) {
      return response.data.data;
    } else {
      // Return empty array if error
      return [];
    }
  },

  /**
   * Get all kategori enum labels
   * GET /api/admin/kategori/get-all
   */
  async getAllKategoriEnum(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/admin/kategori/get-all');
    return response.data;
  },

  /**
   * Get all kategori (paginated)
   * POST /api/admin/kategori/find-all
   */
  async getAllKategoriPaginated(filter: KategoriBukuFilterRequest & { page?: number; size?: number }): Promise<PaginatedResponse<KategoriBuku>> {
    const response = await apiClient.post<ApiResponse<PaginatedResponse<KategoriBuku>>>(
      '/admin/kategori/find-all',
      filter
    );

    if (response.status === 200 && response.data.success && response.data.data) {
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
   * Get kategori by ID
   * GET /api/admin/kategori/:id
   */
  async getKategoriById(id: string): Promise<KategoriBuku> {
    const response = await apiClient.get<ApiResponse<KategoriBuku>>(`/admin/kategori/${id}`);

    if (response.status === 200 && response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch kategori');
    }
  },

  /**
   * Create new kategori
   * POST /api/admin/kategori
   */
  async createKategori(data: CreateKategoriRequest): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>('/admin/kategori', data);

    if (response.status !== 200 || !response.data.success) {
      throw new Error(response.data.message || 'Failed to create kategori');
    }
  },

  /**
   * Update kategori
   * PUT /api/admin/kategori (id in request body)
   */
  async updateKategori(data: UpdateKategoriRequest): Promise<void> {
    const response = await apiClient.put<ApiResponse<void>>('/admin/kategori', data);

    if (response.status !== 200 || !response.data.success) {
      throw new Error(response.data.message || 'Failed to update kategori');
    }
  },

  /**
   * Delete kategori
   * DELETE /api/admin/kategori/:id
   */
  async deleteKategori(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/kategori/${id}`);

    if (response.status !== 200 || !response.data.success) {
      throw new Error(response.data.message || 'Failed to delete kategori');
    }
  },
};
