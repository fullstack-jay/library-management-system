/**
 * User Service
 * Menangani operasi user profile
 * Endpoint: /api/user/*
 */

import { apiClient } from '../api-client';
import { ApiResponse } from '../viewmodels/responses/ApiResponse';

export const userService = {
  /**
   * Get user profile
   * GET /api/user/profile
   */
  async getUserProfile(): Promise<any> {
    const response = await apiClient.post('/user/profile/me');
    return response.data;
  },

  /**
   * Update user profile
   * POST /api/user/edit
   */
  async updateUserProfile(data: any): Promise<any> {
    const response = await apiClient.post('/user/edit', data);
    return response.data;
  },

  /**
   * Upload User Profile Photo
   * POST /api/user/profile/upload
   */
  async uploadProfilePhoto(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<ApiResponse<string>>(
        '/user/profile/upload',
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
};
