/**
 * Mahasiswa Service
 * Menangani operasi CRUD mahasiswa
 * Endpoint: /api/admin/mahasiswa/*
 */

import { apiClient } from '../api-client';
import {
  CreateMahasiswaRequest,
  UpdateMahasiswaRequest,
  SearchMahasiswaRequest,
} from '../viewmodels/requests/MahasiswaRequest';
import { ApiResponse } from '../viewmodels/responses/ApiResponse';
import { Mahasiswa, PaginatedResponse } from '@/types';

export const mahasiswaService = {
  /**
   * Get all mahasiswa
   * Using POST with SearchMahasiswaRequest in body
   * POST /api/admin/mahasiswa/search
   */
  async getAllMahasiswa(params?: {
    page?: number;
    size?: number;
    search?: string;
    sortColumn?: string;
    sortColumnDir?: 'ASC' | 'DESC';
  }): Promise<PaginatedResponse<Mahasiswa>> {
    // Convert frontend 0-based page to backend 1-based page
    const backendParams: SearchMahasiswaRequest = {
      pageNumber: (params?.page ?? 0) + 1, // Convert to 1-based
      pageSize: params?.size ?? 10,
      search: params?.search,
      sortColumn: params?.sortColumn,
      sortColumnDir: params?.sortColumnDir,
    };


    const response = await apiClient.post<
      ApiResponse<PaginatedResponse<Mahasiswa>>
    >('/admin/mahasiswa/find-all', backendParams);


    // Handle backend response format
    if (
      response.status === 200 &&
      response.data.success &&
      response.data.data
    ) {
      console.log(
        '✅ Mahasiswa found:',
        response.data.data.content?.length || 0
      );
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
   * Get mahasiswa by ID
   * POST /api/admin/mahasiswa/find/{id}
   */
  async getMahasiswaById(id: number): Promise<Mahasiswa> {
    const response = await apiClient.post<ApiResponse<Mahasiswa>>(
      `/admin/mahasiswa/find/${id}`,
      {}
    );

    if (
      response.status === 200 &&
      response.data.success &&
      response.data.data
    ) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch mahasiswa');
    }
  },

  /**
   * Create new mahasiswa
   * POST /api/admin/mahasiswa
   */
  async createMahasiswa(data: CreateMahasiswaRequest): Promise<Mahasiswa> {
    const response = await apiClient.post<ApiResponse<Mahasiswa>>(
      '/admin/mahasiswa/create',
      data
    );

    if (
      response.status === 200 &&
      response.data.success &&
      response.data.data
    ) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to create mahasiswa');
    }
  },

  /**
   * Update mahasiswa
   * POST /api/admin/mahasiswa/update
   */
  async updateMahasiswa(
    id: number,
    data: UpdateMahasiswaRequest
  ): Promise<Mahasiswa> {
    const response = await apiClient.post<ApiResponse<Mahasiswa>>(
      `/admin/mahasiswa/update`,
      {
        id,
        ...data,
      }
    );

    if (
      response.status === 200 &&
      response.data.success &&
      response.data.data
    ) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to update mahasiswa');
    }
  },

  /**
   * Delete mahasiswa
   * DELETE /api/admin/mahasiswa/{userId}
   * Backend expects userId (String) to delete both mahasiswa and user records
   */
  async deleteMahasiswa(userId: number): Promise<void> {

    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `/admin/mahasiswa/${userId}`
      );


      if (response.status !== 200 || !response.data.success) {
        throw new Error(response.data.message || 'Failed to delete mahasiswa');
      }
    } catch (error: any) {
      throw error;
    }
  },
};
