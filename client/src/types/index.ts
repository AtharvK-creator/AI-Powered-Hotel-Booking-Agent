// ─── TypeScript Types ─────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface RoomType {
  type: string;
  price: number;
  capacity: number;
  description: string;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  address: string;
  rating: number;
  price_per_night: number;
  amenities: string[];
  images: string[];
  room_types: RoomType[];
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  hotel_id: string;
  room_type: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: 'confirmed' | 'modified' | 'cancelled' | 'completed';
  special_requests?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  hotel_name?: string;
  hotel_city?: string;
  hotel_country?: string;
  hotel_image?: string;
  user_name?: string;
  user_email?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

export interface SearchParams {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  guests?: number;
  checkIn?: string;
  checkOut?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalHotels: number;
  totalBookings: number;
  totalRevenue: number;
}
