'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { User, Mail, Shield, Calendar, Edit, Key, Camera, Upload } from 'lucide-react';
import { api } from '@/lib/api';

interface UpdateProfileRequest {
  id: string;
  nama: string;
  email: string;
  fotoProfile?: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AdminProfilePage() {
  const { user, token } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  // Helper function untuk build full URL foto
  const getFullPhotoUrl = (fotoPath: string | undefined | null) => {
    // Return empty string jika tidak ada path atau bukan string
    if (!fotoPath || typeof fotoPath !== 'string' || fotoPath === '') {
      return '';
    }

    // Jika sudah full URL (mulai dengan http), return as is
    if (fotoPath.startsWith('http://') || fotoPath.startsWith('https://')) {
      return fotoPath;
    }

    // Build base URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const baseUrl = apiUrl.replace('/api', ''); // → http://localhost:8080

    // Jika path sudah mengandung /uploads/, gunakan langsung dengan baseUrl
    if (fotoPath.includes('/uploads/')) {
      const fullUrl = `${baseUrl}${fotoPath}`;
      return fullUrl;
    }

    // Jika path sudah mengandung /admin/, tambahkan /uploads/ di depannya
    if (fotoPath.includes('/admin/')) {
      const fullUrl = `${baseUrl}/uploads${fotoPath}`;
      return fullUrl;
    }

    // Jika relative path murni (hanya filename), gabungkan dengan base URL
    const fullUrl = `${baseUrl}/uploads/admin/${fotoPath}`;
    return fullUrl;
  };

  // Helper untuk cek apakah foto valid
  const isPhotoValid = (fotoPath: string | undefined | null) => {
    return fotoPath && typeof fotoPath === 'string' && fotoPath.trim() !== '';
  };

  const [profileData, setProfileData] = useState<UpdateProfileRequest>({
    id: '',
    nama: '',
    email: '',
    fotoProfile: '',
  });

  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch profile data dari backend
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      try {
        setIsFetchingProfile(true);

        const profileData = await api.getAdminProfile();
        console.log('Backend profile response:', profileData);

        const finalFotoUrl = profileData.fotoUrl || profileData.fotoProfile || profileData.foto || '';

        // ID directly from /admin/profile/me response
        setProfileData({
          id: profileData.id || '',
          nama: profileData.nama || profileData.username || '',
          email: profileData.email || '',
          fotoProfile: finalFotoUrl, // Simpan path relatif
        });
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        // Fallback ke data dari auth context
        if (user) {
          setProfileData({
            id: user.id?.toString() || '',
            nama: user.nama || user.username || '',
            email: user.email || '',
            fotoProfile: user.fotoProfile || '',
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
        text: ' Harap pilih file gambar (JPG, PNG, dll)',
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
      const photoUrl = await api.uploadAdminProfilePhoto(file);

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

      // Refresh profile data dari backend untuk mendapatkan data terbaru
      const updatedProfile = await api.getAdminProfile();
      setProfileData({
        id: updatedProfile.id || '',
        nama: updatedProfile.nama || updatedProfile.username || '',
        email: updatedProfile.email || '',
        fotoProfile: updatedProfile.fotoUrl || updatedProfile.fotoProfile || updatedProfile.foto || photoUrl,
      });
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
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
      console.log('Updating profile with data:', profileData);
      await api.updateAdminProfile(profileData);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Profile berhasil diupdate!',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      setIsEditModalOpen(false);

      // Refresh profile data dari backend
      try {
        const updatedProfile = await api.getAdminProfile();
        setProfileData({
          id: updatedProfile.id || '',
          nama: updatedProfile.nama || updatedProfile.username || '',
          email: updatedProfile.email || '',
          fotoProfile: updatedProfile.fotoUrl || updatedProfile.fotoProfile || updatedProfile.foto || '',
        });
      } catch (error) {
        // Fallback: reload page
        setTimeout(() => {
          window.location.reload();
        }, 2000);
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Tidak Cocok',
        text: 'Password baru dan konfirmasi password tidak sama!',
        confirmButtonColor: '#ef4444',
      });
      setIsLoading(false);
      return;
    }

    try {
      const changePasswordData = {
        id: profileData.id,
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      };

      await api.changeAdminPassword(changePasswordData);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Password berhasil diubah!',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      setIsPasswordModalOpen(false);
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.data ||
        error.message ||
        'Gagal mengubah password';

      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengubah Password',
        text: errorMsg,
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Admin</h1>
        <p className="mt-2 text-gray-600">Kelola informasi akun admin Anda</p>
      </div>

      {isFetchingProfile ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-600">Memuat profile...</div>
          </div>
        </Card>
      ) : (
        <>
      {/* Profile Information Card */}
      <Card title="Informasi Profile">
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6 pb-6 border-b">
            <div className="relative">
              {isPhotoValid(profileData?.fotoProfile) ? (
                <>
                  <img
                    src={getFullPhotoUrl(profileData.fotoProfile!)}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      // Tampilkan fallback avatar
                      const fallback = (e.target as HTMLImageElement).nextElementSibling;
                      if (fallback) {
                        (fallback as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                  {/* Fallback avatar (hidden by default) */}
                  <div
                    className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                    style={{ display: 'none' }}
                  >
                    {profileData?.nama?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'A'}
                  </div>
                </>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {profileData?.nama?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'A'}
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
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Upload Foto"
              >
                {isUploadingPhoto ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
              </button>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {profileData?.nama || user?.username}
              </h3>
              <p className="text-gray-600 mt-1">@{user?.username}</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <Shield size={14} className="mr-1" />
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Nama Lengkap</p>
                <p className="text-gray-900 font-semibold mt-1">
                  {profileData?.nama || '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900 font-semibold mt-1">{profileData?.email || user?.email}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="text-gray-900 font-semibold mt-1">{user?.role}</p>
              </div>
            </div>

            {user?.createdAt && (
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Bergabung Sejak
                  </p>
                  <p className="text-gray-900 font-semibold mt-1">
                    {new Date(user.createdAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 md:flex-none"
            >
              <Edit size={18} className="mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex-1 md:flex-none"
            >
              <Key size={18} className="mr-2" />
              Ganti Password
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <Input
              label="Nama Lengkap"
              value={profileData.nama}
              onChange={(e) =>
                setProfileData({ ...profileData, nama: e.target.value })
              }
              required
              placeholder="Masukkan nama lengkap"
            />
          </div>
          <div>
            <Input
              label="Email"
              type="email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
              required
              placeholder="Masukkan email"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsEditModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Ganti Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <Input
              label="Password Lama"
              type="password"
              value={passwordData.oldPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  oldPassword: e.target.value,
                })
              }
              required
              placeholder="Masukkan password lama"
            />
          </div>
          <div>
            <Input
              label="Password Baru"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              required
              placeholder="Masukkan password baru"
            />
          </div>
          <div>
            <Input
              label="Konfirmasi Password Baru"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              required
              placeholder="Masukkan kembali password baru"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Ganti Password'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
      )}
    </div>
  );
}
