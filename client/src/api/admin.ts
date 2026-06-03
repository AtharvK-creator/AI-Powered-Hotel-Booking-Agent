import api from './axios';
import { ApiResponse, AdminStats, User, Booking } from '../types';

export const adminApi = {
  getStats: () =>
    api.get<ApiResponse<AdminStats>>('/admin/stats'),

  getUsers: (limit = 50, offset = 0) =>
    api.get<ApiResponse<User[]>>('/admin/users', { params: { limit, offset } }),

  getBookings: (limit = 100, offset = 0) =>
    api.get<ApiResponse<Booking[]>>('/admin/bookings', { params: { limit, offset } }),
};
