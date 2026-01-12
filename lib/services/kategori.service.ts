/**
 * Kategori Service
 * Menangani operasi CRUD kategori buku
 * Endpoint: /api/admin/kategori/* dan /api/user/kategori/*
 */

import { apiClient } from '../api-client';
import {
  CreateKategoriRequest,
  UpdateKategoriRequest,
} from '../viewmodels/requests/KategoriRequest';
import { ApiResponse } from '../viewmodels/responses/ApiResponse';
import { KategoriBuku, PaginatedResponse } from '@/types';

export const kategoriService = {
  /**
   * Get all kategori (User/Public)
   * POST /api/user/kategori
   */
  async getAllKategoriUser(): Promise<KategoriBuku[]> {
    try {
      const response = await apiClient.post<ApiResponse<KategoriBuku[]>>(
        '/user/kategori',
        {}
      );

      if (
        response.status === 200 &&
        response.data.success &&
        response.data.data
      ) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching user kategori:', error);
    }

    return [];
  },

  /**
   * Get all kategori (Admin)
   * POST /api/admin/kategori/find-all
   */
  async getAllKategori(): Promise<KategoriBuku[]> {
    try {
      const response = await apiClient.post<
        ApiResponse<PaginatedResponse<KategoriBuku>>
      >('/admin/kategori/find-all', {
        sortColumn: 'id',
        sortColumnDir: 'DESC',
        pageNumber: 1,
        pageSize: 100,
        search: '',
      });

      if (
        response.status === 200 &&
        response.data.success &&
        response.data.data
      ) {
        return response.data.data.content || [];
      }
    } catch (error) {
      console.error('Error fetching all kategori:', error);
    }

    return [];
  },

  /**
   * Get kategori by ID
   * POST /api/admin/kategori/find-by-id
   */
  async getKategoriById(id: string): Promise<KategoriBuku> {
    const response = await apiClient.post<ApiResponse<KategoriBuku>>(
      '/admin/kategori/find-by-id',
      { id }
    );

    if (
      response.status === 200 &&
      response.data.success &&
      response.data.data
    ) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch kategori');
    }
  },

  /**
   * Create new kategori
   * POST /api/admin/kategori/create
   */
  async createKategori(data: CreateKategoriRequest): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/admin/kategori/create',
      data
    );

    if (response.status !== 200 || !response.data.success) {
      throw new Error(response.data.message || 'Failed to create kategori');
    }
  },

  /**
   * Update kategori
   * POST /api/admin/kategori/edit
   */
  async updateKategori(data: UpdateKategoriRequest): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/admin/kategori/edit',
      data
    );

    if (response.status !== 200 || !response.data.success) {
      throw new Error(response.data.message || 'Failed to update kategori');
    }
  },

  /**
   * Delete kategori
   * DELETE /api/admin/kategori/:id
   */
  async deleteKategori(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/admin/kategori/${id}`
    );

    if (response.status !== 200 || !response.data.success) {
      throw new Error(response.data.message || 'Failed to delete kategori');
    }
  },
};
