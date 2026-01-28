/**
 * Centralized Application Configuration
 * All environment variables and constants should be defined here
 */

export const config = {
  // API Configuration
  api: {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1010/api',
    get baseUrl(): string {
      return this.url.replace('/api', '');
    },
  },

  // Helper function untuk build full URL untuk file uploads
  buildFileUrl: (filePath: string | undefined | null): string => {
    if (!filePath || typeof filePath !== 'string' || filePath === '') {
      return '';
    }

    // Jika sudah full URL, return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    const baseUrl = config.api.baseUrl;

    // Jika path sudah mengandung /uploads/, gunakan langsung dengan baseUrl
    if (filePath.includes('/uploads/')) {
      return `${baseUrl}${filePath}`;
    }

    // Jika path sudah mengandung /admin/, tambahkan /uploads/ di depannya
    if (filePath.includes('/admin/')) {
      return `${baseUrl}/uploads${filePath}`;
    }

    // Jika path sudah mengandung /user/, tambahkan /uploads/ di depannya
    if (filePath.includes('/user/')) {
      return `${baseUrl}/uploads${filePath}`;
    }

    // Default: assume relative path murni (hanya filename)
    // Default ke admin uploads untuk admin context
    return `${baseUrl}/uploads/admin/${filePath}`;
  },
};

export default config;
