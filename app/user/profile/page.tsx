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
  id?: string;
  nama: string;
  email: string;
  nim: string;
  jurusan: string;
  notelepon?: string;
  alamat?: string;
  tanggalBergabung?: string;
}

export default function UserProfilePage() {
  const { user, token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState<UpdateProfileRequest>({
    nama: '',
    email: '',
    nim: '',
    jurusan: '',
    notelepon: '',
    alamat: '',
  });

  const [profileData, setProfileData] = useState<
    UpdateProfileRequest & { fotoProfile?: string }
  >({
    nama: '',
    email: '',
    nim: '',
    jurusan: '',
    notelepon: '',
    alamat: '',
    fotoProfile: '',
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

        const finalFotoUrl =
          userData.fotoUrl || userData.fotoProfile || userData.foto || '';

        setProfileData({
          id: userData.id || userData.userId || '',
          nama: userData.nama || '',
          email: userData.email || '',
          nim: userData.nim || '',
          jurusan: userData.jurusan || '',
          notelepon: userData.notelepon || userData.noHp || '',
          alamat: userData.alamat || '',
          fotoProfile: finalFotoUrl,
          tanggalBergabung: userData.tanggalBergabung || userData.createdAt || '',
        });

        setFormData({
          nama: userData.nama || '',
          email: userData.email || '',
          nim: userData.nim || '',
          jurusan: userData.jurusan || '',
          notelepon: userData.notelepon || userData.noHp || '',
          alamat: userData.alamat || '',
          tanggalBergabung: userData.tanggalBergabung || userData.createdAt || '',
        });
      } catch (error: any) {
        // Fallback ke data dari auth context
        if (user) {
          setProfileData({
            nama: user.nama || '',
            email: user.email || '',
            nim: user.nim || '',
            jurusan: user.jurusan || '',
            notelepon: user.notelepon || '',
            alamat: user.alamat || '',
            fotoProfile: '',
          });

          setFormData({
            nama: user.nama || '',
            email: user.email || '',
            nim: user.nim || '',
            jurusan: user.jurusan || '',
            notelepon: user.notelepon || '',
            alamat: user.alamat || '',
          });
        }
      } finally {
        setIsFetchingProfile(false);
      }
    };

    fetchProfile();
  }, [token]);

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
    setIsLoading(true);

    try {
      await api.updateUserProfile(formData);

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
          id: userData.id || userData.userId || '',
          nama: userData.nama || '',
          email: userData.email || '',
          nim: userData.nim || '',
          jurusan: userData.jurusan || '',
          notelepon: userData.notelepon || userData.noHp || '',
          alamat: userData.alamat || '',
          fotoProfile:
            userData.fotoUrl || userData.fotoProfile || userData.foto || '',
        });

        setFormData({
          nama: userData.nama || '',
          email: userData.email || '',
          nim: userData.nim || '',
          jurusan: userData.jurusan || '',
          notelepon: userData.notelepon || userData.noHp || '',
          alamat: userData.alamat || '',
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
      nama: profileData.nama,
      email: profileData.email,
      nim: profileData.nim,
      jurusan: profileData.jurusan,
      notelepon: profileData.notelepon || '',
      alamat: profileData.alamat || '',
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
                <Button type="button" onClick={() => setIsEditing(true)}>
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
