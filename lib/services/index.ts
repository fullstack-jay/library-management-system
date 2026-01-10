/**
 * Central export untuk semua services
 * Mudah di-import: import { authService, bukuService } from '@/lib/services';
 */

export { authService } from './auth.service';
export { bukuService } from './buku.service';
export { kategoriService } from './kategori.service';
export { mahasiswaService } from './mahasiswa.service';
export { peminjamanService } from './peminjaman.service';
export { userService } from './user.service';
export { adminService } from './admin.service';
export { statusBukuService } from './status-buku.service';

// Backward compatibility wrapper - Create 'api' object with all methods
import { authService as authSvc } from './auth.service';
import { bukuService as bukuSvc } from './buku.service';
import { kategoriService as kategoriSvc } from './kategori.service';
import { mahasiswaService as mahasiswaSvc } from './mahasiswa.service';
import { peminjamanService as peminjamanSvc } from './peminjaman.service';
import { userService as userSvc } from './user.service';
import { adminService as adminSvc } from './admin.service';
import { statusBukuService as statusBukuSvc } from './status-buku.service';

export const api = {
  // Auth
  login: authSvc.login,
  logout: authSvc.logout,
  updateAdminProfile: adminSvc.updateProfile,
  changeAdminPassword: adminSvc.changePassword,
  uploadAdminProfilePhoto: adminSvc.uploadProfilePhoto,

  // Admin
  getAdminProfile: adminSvc.getProfile,
  getAdminDashboard: adminSvc.getDashboardStats,

  // Buku
  getAllBukuAdmin: bukuSvc.getAllBukuAdmin,
  getBukuByIdAdmin: bukuSvc.getBukuByIdAdmin,
  createBuku: bukuSvc.createBuku,
  updateBuku: bukuSvc.updateBuku,
  deleteBuku: bukuSvc.deleteBuku,

  // Kategori
  getAllKategori: kategoriSvc.getAllKategori,
  getAllKategoriUser: kategoriSvc.getAllKategoriUser,
  getKategoriById: kategoriSvc.getKategoriById,
  createKategori: kategoriSvc.createKategori,
  updateKategori: kategoriSvc.updateKategori,
  deleteKategori: kategoriSvc.deleteKategori,

  // Mahasiswa
  getAllMahasiswa: mahasiswaSvc.getAllMahasiswa,
  getMahasiswaById: mahasiswaSvc.getMahasiswaById,
  createMahasiswa: mahasiswaSvc.createMahasiswa,
  updateMahasiswa: mahasiswaSvc.updateMahasiswa,
  deleteMahasiswa: mahasiswaSvc.deleteMahasiswa,

  // Peminjaman (Admin)
  getAllPeminjamanAdmin: peminjamanSvc.getAllPeminjamanAdmin,
  getPeminjamanByIdAdmin: peminjamanSvc.getPeminjamanByIdAdmin,
  updatePeminjamanAdmin: peminjamanSvc.updatePeminjamanAdmin,
  deletePeminjaman: peminjamanSvc.deletePeminjaman,

  // User
  getUserProfile: userSvc.getUserProfile,
  updateUserProfile: userSvc.updateUserProfile,
  uploadUserProfilePhoto: userSvc.uploadProfilePhoto,

  // Buku (User)
  getAllBukuUser: bukuSvc.getAllBukuUser,
  getBukuByIdUser: bukuSvc.getBukuByIdUser,

  // Status Buku
  getStatusBuku: statusBukuSvc.getStatusBuku,

  // Peminjaman (User)
  getAllPeminjamanUser: peminjamanSvc.getAllPeminjamanUser,
  getPeminjamanByIdUser: peminjamanSvc.getPeminjamanByIdUser,
  createPeminjaman: peminjamanSvc.createPeminjaman,
  returnPeminjaman: peminjamanSvc.returnPeminjaman,
  requestReturnPeminjaman: peminjamanSvc.requestReturnPeminjaman,

  // Peminjaman (Admin - Approval)
  approveReturn: adminSvc.approveReturn,
  getPendingReturns: adminSvc.getPendingReturns,
  checkOverduePeminjaman: adminSvc.checkOverduePeminjaman,
};
