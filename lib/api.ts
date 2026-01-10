/**
 * API - Backward Compatibility Wrapper
 *
 * This file re-exports all services for backward compatibility.
 * Old code using `import { api } from '@/lib/api'` will still work.
 *
 * Migration guide:
 * OLD: import { api } from '@/lib/api';
 *      await api.getAllBukuAdmin();
 *
 * NEW: import { bukuService } from '@/lib/services';
 *      await bukuService.getAllBukuAdmin();
 */

// Export all services
export * from './services';

// Also export apiClient for direct use if needed
export { apiClient } from './api-client';
