import api from './axios';
import { Booking, ApiResponse } from '../types';

export const bookingsApi = {
  create: (data: {
    hotelId: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    specialRequests?: string;
  }) => api.post<ApiResponse<Booking>>('/bookings', data),

  getMyBookings: () =>
    api.get<ApiResponse<Booking[]>>('/bookings/my'),

  getById: (id: string) =>
    api.get<ApiResponse<Booking>>(`/bookings/${id}`),

  modify: (id: string, data: Partial<{
    roomType: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    specialRequests: string;
  }>) => api.put<ApiResponse<Booking>>(`/bookings/${id}`, data),

  cancel: (id: string) =>
    api.delete<ApiResponse<Booking>>(`/bookings/${id}`),
};
