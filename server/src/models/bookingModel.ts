import { db } from '../config/database';

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
}

export interface BookingWithHotel extends Booking {
  hotel_name: string;
  hotel_city: string;
  hotel_country: string;
  hotel_image: string;
}

export const bookingModel = {
  findById(id: string): Booking | undefined {
    return db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Booking | undefined;
  },

  findByUser(userId: string): BookingWithHotel[] {
    return db.prepare(`
      SELECT b.*, h.name as hotel_name, h.city as hotel_city,
             h.country as hotel_country, h.images as hotel_image
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `).all(userId) as BookingWithHotel[];
  },

  findAll(limit = 100, offset = 0): BookingWithHotel[] {
    return db.prepare(`
      SELECT b.*, h.name as hotel_name, h.city as hotel_city,
             h.country as hotel_country, h.images as hotel_image,
             u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset) as BookingWithHotel[];
  },

  create(data: Omit<Booking, 'created_at' | 'updated_at'>): Booking {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO bookings (id, user_id, hotel_id, room_type, check_in, check_out, guests, total_price, status, special_requests, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.id, data.user_id, data.hotel_id, data.room_type,
      data.check_in, data.check_out, data.guests, data.total_price,
      data.status, data.special_requests ?? null, now, now
    );
    return db.prepare('SELECT * FROM bookings WHERE id = ?').get(data.id) as Booking;
  },

  update(id: string, data: Partial<Pick<Booking, 'check_in' | 'check_out' | 'guests' | 'room_type' | 'total_price' | 'status' | 'special_requests'>>): Booking | undefined {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(', ');
    const values = [...Object.values(data), new Date().toISOString(), id];
    db.prepare(`UPDATE bookings SET ${fields}, updated_at = ? WHERE id = ?`).run(...values);
    return db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Booking | undefined;
  },

  cancel(id: string): Booking | undefined {
    db.prepare("UPDATE bookings SET status = 'cancelled', updated_at = ? WHERE id = ?")
      .run(new Date().toISOString(), id);
    return db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Booking | undefined;
  },

  count(): number {
    const row = db.prepare('SELECT COUNT(*) as count FROM bookings').get() as { count: number };
    return row.count;
  },

  revenue(): number {
    const row = db.prepare(
      "SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE status != 'cancelled'"
    ).get() as { total: number };
    return row.total;
  },
};
