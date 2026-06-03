import { db } from '../config/database';

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
  amenities: string; // JSON string
  images: string;    // JSON string
  room_types: string; // JSON string
  latitude?: number;
  longitude?: number;
  is_active: number;
  created_at: string;
}

export interface HotelParsed extends Omit<Hotel, 'amenities' | 'images' | 'room_types' | 'is_active' | 'created_at'> {
  amenities: string[];
  images: string[];
  room_types: RoomType[];
  is_active: boolean;
  created_at?: string;
}

function parse(hotel: Hotel): HotelParsed {
  return {
    ...hotel,
    amenities: JSON.parse(hotel.amenities),
    images: JSON.parse(hotel.images),
    room_types: JSON.parse(hotel.room_types),
    is_active: hotel.is_active === 1,
  };
}

export const hotelModel = {
  findById(id: string): HotelParsed | undefined {
    const row = db.prepare('SELECT * FROM hotels WHERE id = ? AND is_active = 1').get(id) as Hotel | undefined;
    return row ? parse(row) : undefined;
  },

  findAll(): HotelParsed[] {
    return (db.prepare('SELECT * FROM hotels WHERE is_active = 1 ORDER BY rating DESC').all() as Hotel[]).map(parse);
  },

  search(params: {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    guests?: number;
    checkIn?: string;
    checkOut?: string;
  }): HotelParsed[] {
    let query = 'SELECT * FROM hotels WHERE is_active = 1';
    const args: (string | number)[] = [];

    if (params.city) {
      query += ' AND LOWER(city) LIKE ?';
      args.push(`%${params.city.toLowerCase()}%`);
    }
    if (params.minPrice !== undefined) {
      query += ' AND price_per_night >= ?';
      args.push(params.minPrice);
    }
    if (params.maxPrice !== undefined) {
      query += ' AND price_per_night <= ?';
      args.push(params.maxPrice);
    }
    if (params.minRating !== undefined) {
      query += ' AND rating >= ?';
      args.push(params.minRating);
    }

    query += ' ORDER BY rating DESC';
    return (db.prepare(query).all(...args) as Hotel[]).map(parse);
  },

  upsert(hotel: Omit<HotelParsed, 'created_at'>): void {
    db.prepare(`
      INSERT OR REPLACE INTO hotels
        (id, name, city, country, description, address, rating, price_per_night, amenities, images, room_types, latitude, longitude, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      hotel.id, hotel.name, hotel.city, hotel.country, hotel.description,
      hotel.address, hotel.rating, hotel.price_per_night,
      JSON.stringify(hotel.amenities), JSON.stringify(hotel.images),
      JSON.stringify(hotel.room_types), hotel.latitude ?? null,
      hotel.longitude ?? null, hotel.is_active ? 1 : 0
    );
  },

  count(): number {
    const row = db.prepare('SELECT COUNT(*) as count FROM hotels WHERE is_active = 1').get() as { count: number };
    return row.count;
  },
};
