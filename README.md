# Library Management System

Aplikasi Sistem Manajemen Perpustakaan Kampus yang dibangun dengan Next.js 16, React 19, dan Tailwind CSS. Aplikasi ini terintegrasi dengan backend Java untuk mengelola operasional perpustakaan kampus.

## Fitur Utama

### 🔐 Autentikasi & Autorisasi

- Login dan Register untuk mahasiswa dan admin
- Role-based access control (Admin & User)
- Token-based authentication dengan JWT

### 👨‍💼 Fitur Admin

- **Dashboard**: Overview statistik perpustakaan
- **Manajemen Buku**: CRUD buku dengan fitur pencarian dan pagination
- **Manajemen Kategori**: CRUD kategori buku
- **Manajemen Mahasiswa**: CRUD data mahasiswa
- **Manajemen Peminjaman**: Kelola peminjaman, pengembalian, dan denda

### 👨‍🎓 Fitur User (Mahasiswa)

- **Dashboard**: Overview peminjaman aktif dan statistik
- **Katalog Buku**: Cari dan telusuri buku dengan filter kategori
- **Peminjaman Buku**: Pinjam buku dengan real-time status
- **Riwayat Peminjaman**: Lihat riwayat dan status peminjaman
- **Profile**: Kelola profil pribadi

## Teknologi yang Digunakan

### Frontend

- **Next.js 16** - React framework dengan App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **date-fns** - Date manipulation

### Backend (Java)

- Spring Boot
- Spring Security
- JPA/Hibernate
- REST API

## Struktur Project

```
library-management-system/
├── app/
│   ├── admin/                 # Halaman Admin
│   │   ├── dashboard/         # Dashboard Admin
│   │   ├── buku/              # Manajemen Buku
│   │   ├── kategori/          # Manajemen Kategori
│   │   ├── mahasiswa/         # Manajemen Mahasiswa
│   │   ├── peminjaman/        # Manajemen Peminjaman
│   │   └── layout.tsx         # Layout Admin
│   ├── user/                  # Halaman User
│   │   ├── dashboard/         # Dashboard User
│   │   ├── buku/              # Katalog Buku
│   │   ├── peminjaman/        # Peminjaman User
│   │   ├── profile/           # Profile User
│   │   └── layout.tsx         # Layout User
│   ├── auth/                  # Autentikasi
│   │   ├── login/             # Halaman Login
│   │   └── register/          # Halaman Register
│   ├── layout.tsx             # Root Layout
│   └── page.tsx               # Home Page
├── components/                # Reusable Components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Table.tsx
│   └── Pagination.tsx
├── contexts/                  # React Context
│   └── AuthContext.tsx        # Authentication Context
├── lib/                       # Utilities
│   └── api.ts                 # API Client
├── types/                     # TypeScript Types
│   └── index.ts               # Type Definitions
└── public/                    # Static Assets
```

## API Endpoints

### Auth

- `POST /api/auth/login` - Login
- `POST /api/auth/pendaftaran ` - Pendaftaran
- `POST /api/auth/logout` - Logout

### Admin

- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/buku` - Get all buku
- `POST /api/admin/buku` - Create buku
- `PUT /api/admin/buku/:id` - Update buku
- `DELETE /api/admin/buku/:id` - Delete buku
- `GET /api/admin/kategori` - Get all kategori
- `POST /api/admin/kategori` - Create kategori
- `PUT /api/admin/kategori/:id` - Update kategori
- `DELETE /api/admin/kategori/:id` - Delete kategori
- `GET /api/admin/mahasiswa` - Get all mahasiswa
- `POST /api/admin/mahasiswa` - Create mahasiswa
- `PUT /api/admin/mahasiswa/:id` - Update mahasiswa
- `DELETE /api/admin/mahasiswa/:id` - Delete mahasiswa
- `GET /api/admin/peminjaman` - Get all peminjaman
- `PUT /api/admin/peminjaman/:id` - Update peminjaman
- `DELETE /api/admin/peminjaman/:id` - Delete peminjaman

### User

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/buku` - Get katalog buku
- `GET /api/user/buku/:id` - Get detail buku
- `GET /api/user/status-buku/:id` - Get status buku
- `GET /api/user/peminjaman` - Get peminjaman user
- `POST /api/user/peminjaman` - Create peminjaman
- `POST /api/user/peminjaman/:id/return` - Return buku

## Getting Started

### Prerequisites

- Node.js 20+
- npm atau yarn
- Backend Java API (running on port 1010)

### Installation

1. Clone repository

```bash
git clone <repository-url>
cd library-management-system
```

2. Install dependencies

```bash
npm install
```

3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` dan sesuaikan dengan URL backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:1010/api
```

4. Run development server

```bash
npm run dev
```

5. Buka [http://localhost:3000](http://localhost:3000) di browser

### Build untuk Production

```bash
npm run build
npm start
```

## Credentials Demo

### Admin

- Username: `admin`
- Password: `admin123`

### User

- Username: `user`
- Password: `user123`

## Kontribusi

Kontribusi sangat dihargai! Silakan buat Pull Request atau buka Issue untuk melaporkan bug.

## License

This project is licensed under the MIT License.
