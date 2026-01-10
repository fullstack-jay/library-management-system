'use client';

import React, { useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { User, Mail, Phone, MapPin, Calendar, Camera } from 'lucide-react';
import { api } from '@/lib/services';

interface UpdateProfileRequest {
  id: string;
  nama: string;
  username: string;
  email: string;
  password?: string;
  status: string;
  role: string;
  nim: string;
  notelepon?: string;
  jurusan: string;
  alamat?: string;
}

export default function UserProfilePage() {
  const { user, token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState<UpdateProfileRequest & { password?: string }>({
    id: '',
    nama: '',
    username: '',
    email: '',
    status: '',
    role: '',
    nim: '',
    notelepon: '',
    jurusan: '',
    alamat: '',
    password: '',
  });

  const [profileData, setProfileData] = useState<
    UpdateProfileRequest & { fotoProfile?: string; tanggalBergabung?: string; password?: string }
  >({
    id: '',
    nama: '',
    username: '',
    email: '',
    status: '',
    role: '',
    nim: '',
    notelepon: '',
    jurusan: '',
    alamat: '',
    fotoProfile: '',
    tanggalBergabung: '',
    password: '',
  });

  // Helper function untuk build full URL foto
  const getFullPhotoUrl = (fotoPath: string | undefined | null) => {
    if (!fotoPath || typeof fotoPath !== 'string' || fotoPath === '') {
      return '';
    }

    if (fotoPath.startsWith('http://') || fotoPath.startsWith('https://')) {
      return fotoPath;
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const baseUrl = apiUrl.replace('/api', '');

    if (fotoPath.includes('/uploads/')) {
      return `${baseUrl}${fotoPath}`;
    }

    if (fotoPath.includes('/user/')) {
      return `${baseUrl}/uploads${fotoPath}`;
    }

    return `${baseUrl}/uploads/user/${fotoPath}`;
  };

  // Fetch profile data dari backend
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      try {
        setIsFetchingProfile(true);

        const profileResponse = await api.getUserProfile();

        // Extract data from response
        const userData = profileResponse.data || profileResponse;
        console.log('User profile response:', userData);

        const finalFotoUrl =
          userData.fotoUrl || userData.fotoProfile || userData.foto || '';

        // ID directly from /user/profile/me response
        setProfileData({
          id: userData.id || '',
          nama: userData.nama || '',
          username: userData.username || '',
          email: userData.email || '',
          status: userData.status || '',
          role: userData.role || '',
          nim: userData.nim || '',
          jurusan: userData.jurusan || '',
          notelepon: userData.notelepon || userData.noHp || '',
          alamat: userData.alamat || '',
          fotoProfile: finalFotoUrl,
          tanggalBergabung: userData.tanggalBergabung || userData.createdAt || '',
          password: userData.password || '',
        });

        setFormData({
          id: userData.id || '',
          nama: userData.nama || '',
          username: userData.username || '',
          email: userData.email || '',
          status: userData.status || '',
          role: userData.role || '',
          nim: userData.nim || '',
          jurusan: userData.jurusan || '',
          notelepon: userData.notelepon || userData.noHp || '',
          alamat: userData.alamat || '',
          password: userData.password || '',
        });
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        // Fallback ke data dari auth context
        if (user) {
          setProfileData({
            id: user.id?.toString() || '',
            nama: user.nama || '',
            username: user.username || '',
            email: user.email || '',
            status: user.status || '',
            role: user.role || '',
            nim: user.nim || '',
            jurusan: user.jurusan || '',
            notelepon: user.notelepon || '',
            alamat: user.alamat || '',
            fotoProfile: '',
            tanggalBergabung: user.tanggalBergabung || user.createdAt || '',
            password: user.password || '',
          });

          setFormData({
            id: user.id?.toString() || '',
            nama: user.nama || '',
            username: user.username || '',
            email: user.email || '',
            status: user.status || '',
            role: user.role || '',
            nim: user.nim || '',
            jurusan: user.jurusan || '',
            notelepon: user.notelepon || '',
            alamat: user.alamat || '',
            password: user.password || '',
          });
        }
      } finally {
        setIsFetchingProfile(false);
      }
    };

    fetchProfile();
  }, [token, user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'File Tidak Valid',
        text: 'Harap pilih file gambar (JPG, PNG, dll)',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Terlalu Besar',
        text: 'Ukuran file maksimal 2MB',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const photoUrl = await api.uploadUserProfilePhoto(file);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Foto profile berhasil diupload!',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      // Update profileData dengan URL foto baru
      setProfileData({
        ...profileData,
        fotoProfile: photoUrl,
      });

      // Refresh profile data dari backend
      const updatedProfile = await api.getUserProfile();
      const userData = updatedProfile.data || updatedProfile;
      const finalFotoUrl =
        userData.fotoUrl || userData.fotoProfile || userData.foto || photoUrl;

      setProfileData((prev) => ({
        ...prev,
        fotoProfile: finalFotoUrl,
      }));
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.data ||
        error.message ||
        'Gagal mengupload foto profile';

      Swal.fire({
        icon: 'error',
        title: 'Gagal Upload',
        text: errorMsg,
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that id is not empty
    if (!profileData.id || profileData.id.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'ID profil tidak valid. Silakan refresh halaman dan coba lagi.',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Updating user profile with data:', {
        id: profileData.id,
        nama: formData.nama,
        username: profileData.username,
        email: formData.email,
        password: formData.password || profileData.password,
        status: profileData.status,
        role: profileData.role,
        nim: formData.nim,
        notelepon: formData.notelepon,
        jurusan: formData.jurusan,
        alamat: formData.alamat,
      });
      await api.updateUserProfile({
        id: profileData.id,
        nama: formData.nama,
        username: profileData.username,
        email: formData.email,
        password: formData.password || profileData.password,
        status: profileData.status,
        role: profileData.role,
        nim: formData.nim,
        notelepon: formData.notelepon,
        jurusan: formData.jurusan,
        alamat: formData.alamat,
      });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Profile berhasil diupdate!',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      setIsEditing(false);

      // Refresh profile data dari backend
      try {
        const updatedProfile = await api.getUserProfile();
        const userData = updatedProfile.data || updatedProfile;

        setProfileData({
          id: userData.id || '',
          nama: userData.nama || '',
          username: userData.username || '',
          email: userData.email || '',
          status: userData.status || '',
          role: userData.role || '',
          nim: userData.nim || '',
          jurusan: userData.jurusan || '',
          notelepon: userData.notelepon || userData.noHp || '',
          alamat: userData.alamat || '',
          fotoProfile:
            userData.fotoUrl || userData.fotoProfile || userData.foto || '',
          tanggalBergabung: userData.tanggalBergabung || userData.createdAt || '',
          password: userData.password || profileData.password || '',
        });

        setFormData({
          id: userData.id || '',
          nama: userData.nama || '',
          username: userData.username || '',
          email: userData.email || '',
          status: userData.status || '',
          role: userData.role || '',
          nim: userData.nim || '',
          jurusan: userData.jurusan || '',
          notelepon: userData.notelepon || userData.noHp || '',
          alamat: userData.alamat || '',
          password: userData.password || formData.password || '',
        });
      } catch (error) {
        // Error refreshing profile
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.data ||
        error.message ||
        'Gagal mengupdate profile';

      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengupdate',
        text: errorMsg,
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      id: profileData.id,
      nama: profileData.nama,
      username: profileData.username,
      email: profileData.email,
      status: profileData.status,
      role: profileData.role,
      nim: profileData.nim,
      notelepon: profileData.notelepon || '',
      jurusan: profileData.jurusan,
      alamat: profileData.alamat || '',
      password: profileData.password || '',
    });
    setIsEditing(false);
  };

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state or prevent render until mounted
  if (!mounted || isFetchingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Memuat profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">Kelola informasi profil Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="relative inline-block">
              {profileData.fotoProfile ? (
                <img
                  src={getFullPhotoUrl(profileData.fotoProfile)}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 mx-auto mb-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute bottom-4 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Upload Foto"
              >
                {isUploadingPhoto ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {profileData.nama || user?.username}
            </h2>
            <p className="text-gray-600 mb-4">{profileData.email}</p>
            <Badge variant="info">{user?.role}</Badge>
          </div>
        </Card>

        {/* Profile Details Card */}
        <Card className="lg:col-span-2" title="Informasi Pribadi">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <Input
                  value={user?.username || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full pl-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <Input
                  value={formData.nama}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIM
                </label>
                <Input
                  value={formData.nim}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setFormData({ ...formData, nim: e.target.value })
                  }
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. Telepon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.notelepon}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, notelepon: e.target.value })
                    }
                    className={`w-full pl-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jurusan
                </label>
                <Input
                  value={formData.jurusan}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setFormData({ ...formData, jurusan: e.target.value })
                  }
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    value={formData.alamat}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, alamat: e.target.value })
                    }
                    rows={3}
                    className={`w-full pl-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Masukkan password Anda untuk menyimpan perubahan"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Password diperlukan untuk menyimpan perubahan profil
                  </p>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            ) : (
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setFormData({ ...formData, password: '' });
                  }}
                >
                  Edit Profile
                </Button>
              </div>
            )}
          </form>
        </Card>
      </div>

      {/* Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-lg font-semibold text-gray-900">
                {mounted && (profileData.tanggalBergabung || user?.createdAt)
                  ? new Date(profileData.tanggalBergabung || user?.createdAt || '').toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Type</p>
              <p className="text-lg font-semibold text-gray-900">
                {user?.role || 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Email Verified</p>
              <p className="text-lg font-semibold text-green-600">Yes</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
