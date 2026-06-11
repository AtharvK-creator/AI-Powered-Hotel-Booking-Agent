import api from './axios';
import { ApiResponse, AdminStats, User, Booking } from '../types';

export const adminApi = {
  getStats: () =>
    api.get<ApiResponse<AdminStats>>('/admin/stats'),

  getUsers: (limit = 50, offset = 0) =>
    api.get<ApiResponse<User[]>>('/admin/users', { params: { limit, offset } }),

  getBookings: (limit = 100, offset = 0) =>
    api.get<ApiResponse<Booking[]>>('/admin/bookings', { params: { limit, offset } }),

  getCostAnalytics: () =>
    api.get<ApiResponse<any>>('/admin/cost-analytics'),

  getJourneyAnalytics: () =>
    api.get<ApiResponse<any>>('/admin/journey-analytics'),

  getSystemHealthLive: () =>
    api.get<ApiResponse<any>>('/admin/system-health-live'),

  getBiInsights: () =>
    api.get<ApiResponse<any>>('/admin/bi-insights'),

  getSecurityAuditLogs: (limit = 100, offset = 0) =>
    api.get<ApiResponse<any[]>>('/admin/security-audit-logs', { params: { limit, offset } }),

  exportMetrics: async () => {
    const response = await api.get('/admin/export-metrics', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ai_metrics.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
