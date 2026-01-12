export interface CreateBukuRequest {
  judulBuku: string;
  penulis: string;
  penerbit: string;
  tahunTerbit: number;
  isbn?: string;
  kategoriId?: string;
  jumlahSalinan: number;
  deskripsi?: string;
  lantai?: string;
  ruang?: string;
  rak?: string;
  nomorRak?: string;
  nomorBaris?: string;
  statusBuku?: string;
}

export interface UpdateBukuRequest {
  id: string;
  judulBuku?: string;
  penulis?: string;
  penerbit?: string;
  tahunTerbit?: number;
  isbn?: string;
  kategoriId?: string;
  jumlahSalinan?: number;
  deskripsi?: string;
  // Lokasi Rak - field terpisah sesuai database
  lantai?: string;
  ruang?: string;
  rak?: string;
  nomorRak?: string;
  nomorBaris?: string;
  statusBuku?: string;
}

export interface BukuFilterRequest {
  search?: string;
  judulBuku?: string;
  penulis?: string;
  penerbit?: string;
  kategoriId?: string;
  status?: string;
  sortColumn?: string;
  sortColumnDir?: 'ASC' | 'DESC';
  pageNumber?: number;
  pageSize?: number;
}
