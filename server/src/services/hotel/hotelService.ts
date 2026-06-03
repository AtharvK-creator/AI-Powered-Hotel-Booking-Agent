import { hotelModel, HotelParsed } from '../../models/hotelModel';

// 20 simulated hotels with rich data
const SEED_HOTELS: HotelParsed[] = [
  {
    id: 'hotel-001',
    name: 'The Grand Meridian',
    city: 'New York',
    country: 'USA',
    description: 'A legendary 5-star luxury hotel in the heart of Manhattan, offering panoramic city views, Michelin-starred dining, and world-class spa facilities.',
    address: '50 Central Park South, New York, NY 10019',
    rating: 4.9,
    price_per_night: 450,
    amenities: ['Free WiFi', 'Spa', 'Pool', 'Fitness Center', 'Concierge', 'Valet Parking', 'Room Service', 'Bar'],
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    ],
    room_types: [
      { type: 'Deluxe Room', price: 450, capacity: 2, description: 'Elegant room with city views' },
      { type: 'Suite', price: 750, capacity: 3, description: 'Spacious suite with living area' },
      { type: 'Presidential Suite', price: 1500, capacity: 4, description: 'Ultimate luxury with butler service' },
    ],
    latitude: 40.7651, longitude: -73.9762, is_active: true,
  },
  {
    id: 'hotel-002',
    name: 'Azure Beach Resort',
    city: 'Miami',
    country: 'USA',
    description: 'A stunning oceanfront resort with pristine white sand beaches, turquoise waters, and vibrant nightlife nearby.',
    address: '1 Collins Ave, Miami Beach, FL 33139',
    rating: 4.7,
    price_per_night: 320,
    amenities: ['Beachfront', 'Pool', 'Free WiFi', 'Spa', 'Water Sports', 'Restaurant', 'Bar', 'Fitness Center'],
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
    ],
    room_types: [
      { type: 'Ocean View Room', price: 320, capacity: 2, description: 'Room with stunning ocean views' },
      { type: 'Beach Suite', price: 520, capacity: 3, description: 'Direct beach access suite' },
      { type: 'Penthouse', price: 950, capacity: 6, description: 'Rooftop penthouse with private terrace' },
    ],
    latitude: 25.7617, longitude: -80.1918, is_active: true,
  },
  {
    id: 'hotel-003',
    name: 'The Ritz London',
    city: 'London',
    country: 'UK',
    description: 'An iconic landmark of British elegance since 1906, offering exquisite rooms, afternoon tea, and unparalleled service in the heart of Mayfair.',
    address: '150 Piccadilly, London W1J 9BR',
    rating: 4.9,
    price_per_night: 680,
    amenities: ['Concierge', 'Fine Dining', 'Afternoon Tea', 'Spa', 'Free WiFi', 'Bar', 'Valet Parking'],
    images: [
      'https://images.unsplash.com/photo-1543968996-ee822b8176ba?w=800',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
    ],
    room_types: [
      { type: 'Classic Room', price: 680, capacity: 2, description: 'Classic elegance with Park views' },
      { type: 'Deluxe Suite', price: 1200, capacity: 3, description: 'Lavish suite with antique furnishings' },
      { type: 'Royal Suite', price: 3500, capacity: 4, description: 'The pinnacle of British luxury' },
    ],
    latitude: 51.5074, longitude: -0.1437, is_active: true,
  },
  {
    id: 'hotel-004',
    name: 'Sakura Imperial Hotel',
    city: 'Tokyo',
    country: 'Japan',
    description: 'A harmonious blend of traditional Japanese aesthetics and ultra-modern amenities, located steps from the Imperial Palace Gardens.',
    address: '1-1 Uchisaiwaicho, Chiyoda-ku, Tokyo 100-0011',
    rating: 4.8,
    price_per_night: 380,
    amenities: ['Traditional Onsen', 'Free WiFi', 'Sushi Restaurant', 'Tea Ceremony', 'Fitness Center', 'Concierge'],
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    ],
    room_types: [
      { type: 'Japanese Room', price: 380, capacity: 2, description: 'Traditional tatami room' },
      { type: 'Modern Suite', price: 620, capacity: 3, description: 'Contemporary suite with city views' },
      { type: 'Zen Penthouse', price: 1200, capacity: 4, description: 'Ultimate fusion of east and west' },
    ],
    latitude: 35.6762, longitude: 139.6503, is_active: true,
  },
  {
    id: 'hotel-005',
    name: 'Maison Du Louvre',
    city: 'Paris',
    country: 'France',
    description: 'An intimate boutique hotel with Haussmann-era architecture, situated just 200 meters from the Louvre Museum and Tuileries Garden.',
    address: '4 Rue de Rivoli, 75001 Paris',
    rating: 4.6,
    price_per_night: 290,
    amenities: ['Free WiFi', 'Breakfast Included', 'Concierge', 'Bar', 'Fitness Center', 'Room Service'],
    images: [
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
      'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=800',
    ],
    room_types: [
      { type: 'Classic Double', price: 290, capacity: 2, description: 'Charming Parisian-style room' },
      { type: 'Superior Room', price: 420, capacity: 2, description: 'Room with Louvre views' },
      { type: 'Junior Suite', price: 650, capacity: 3, description: 'Elegant suite with separate lounge' },
    ],
    latitude: 48.8606, longitude: 2.3376, is_active: true,
  },
  {
    id: 'hotel-006',
    name: 'Desert Dunes Sanctuary',
    city: 'Dubai',
    country: 'UAE',
    description: 'An extraordinary ultra-luxury resort rising dramatically from the Arabian Desert, featuring private pools, camel safaris, and stargazing experiences.',
    address: 'Al Maha Desert Resort, Dubai',
    rating: 5.0,
    price_per_night: 850,
    amenities: ['Private Pool', 'Safari Tours', 'Free WiFi', 'Spa', 'Fine Dining', 'Butler Service', 'Yoga'],
    images: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    ],
    room_types: [
      { type: 'Desert Villa', price: 850, capacity: 2, description: 'Luxury villa with private pool' },
      { type: 'Royal Tent Suite', price: 1400, capacity: 4, description: 'Bedouin-inspired luxury suite' },
    ],
    latitude: 24.9953, longitude: 55.2083, is_active: true,
  },
  {
    id: 'hotel-007',
    name: 'Santorini Cliffside Retreat',
    city: 'Santorini',
    country: 'Greece',
    description: 'Perched dramatically on the Oia cliffs with the most spectacular Aegean Sea sunsets in the world, infinity pools, and cave-style luxury suites.',
    address: 'Oia, Santorini 847 02, Greece',
    rating: 4.9,
    price_per_night: 520,
    amenities: ['Infinity Pool', 'Free WiFi', 'Sunset Views', 'Spa', 'Restaurant', 'Concierge', 'Water Sports'],
    images: [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
      'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=800',
    ],
    room_types: [
      { type: 'Caldera View Room', price: 520, capacity: 2, description: 'Cave-style room with volcano views' },
      { type: 'Cave Suite', price: 820, capacity: 3, description: 'Private suite with plunge pool' },
      { type: 'Honeymoon Villa', price: 1200, capacity: 2, description: 'Romantic villa with jacuzzi' },
    ],
    latitude: 36.4618, longitude: 25.3753, is_active: true,
  },
  {
    id: 'hotel-008',
    name: 'Alpine Sky Lodge',
    city: 'Zurich',
    country: 'Switzerland',
    description: 'A magnificent mountain retreat combining Swiss chalet warmth with five-star amenities, ski-in/ski-out access, and breathtaking Alpine panoramas.',
    address: 'Dorfstrasse 12, 7270 Davos, Switzerland',
    rating: 4.7,
    price_per_night: 480,
    amenities: ['Ski Access', 'Spa', 'Free WiFi', 'Fireplace Lounge', 'Restaurant', 'Fitness Center', 'Sauna'],
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    ],
    room_types: [
      { type: 'Chalet Room', price: 480, capacity: 2, description: 'Cozy room with mountain views' },
      { type: 'Alpine Suite', price: 780, capacity: 4, description: 'Spacious suite with fireplace' },
    ],
    latitude: 46.8182, longitude: 8.2275, is_active: true,
  },
  {
    id: 'hotel-009',
    name: 'Singapore Marina Towers',
    city: 'Singapore',
    country: 'Singapore',
    description: 'The iconic three-tower luxury hotel with the world-famous rooftop infinity pool overlooking the glittering Singapore skyline and Marina Bay.',
    address: '10 Bayfront Ave, Singapore 018956',
    rating: 4.8,
    price_per_night: 560,
    amenities: ['Infinity Pool', 'Casino', 'Free WiFi', 'Spa', 'Shopping', 'Fine Dining', 'Fitness Center'],
    images: [
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
      'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800',
    ],
    room_types: [
      { type: 'Deluxe Room', price: 560, capacity: 2, description: 'Modern room with skyline views' },
      { type: 'Club Room', price: 780, capacity: 2, description: 'Access to exclusive club lounge' },
      { type: 'Sky Suite', price: 1400, capacity: 4, description: 'Breathtaking views from every angle' },
    ],
    latitude: 1.2834, longitude: 103.8607, is_active: true,
  },
  {
    id: 'hotel-010',
    name: 'Maldives Water Villas',
    city: 'Male',
    country: 'Maldives',
    description: 'Overwater bungalows sitting above crystal-clear turquoise lagoons in an untouched coral atoll, offering complete seclusion and marine paradise.',
    address: 'North Male Atoll, Maldives',
    rating: 5.0,
    price_per_night: 1200,
    amenities: ['Private Water Villa', 'Snorkeling', 'Spa', 'Free WiFi', 'Diving', 'Fine Dining', 'Seaplane Transfer'],
    images: [
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
      'https://images.unsplash.com/photo-1602002418082-a4443978a5d9?w=800',
    ],
    room_types: [
      { type: 'Water Bungalow', price: 1200, capacity: 2, description: 'Overwater bungalow with glass floor' },
      { type: 'Ocean Villa', price: 1800, capacity: 4, description: 'Spacious villa with private pool' },
    ],
    latitude: 3.2028, longitude: 73.2207, is_active: true,
  },
  {
    id: 'hotel-011',
    name: 'The Beverly Hills Palace',
    city: 'Los Angeles',
    country: 'USA',
    description: "Hollywood's legendary address where celebrities stay, featuring iconic pink bungalows, award-winning cuisine, and legendary banana leaf murals.",
    address: '9641 Sunset Blvd, Beverly Hills, CA 90210',
    rating: 4.8,
    price_per_night: 590,
    amenities: ['Pool', 'Spa', 'Free WiFi', 'Fine Dining', 'Concierge', 'Valet', 'Bar', 'Fitness Center'],
    images: [
      'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
      'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=800',
    ],
    room_types: [
      { type: 'Garden Room', price: 590, capacity: 2, description: 'Serene room surrounded by tropical gardens' },
      { type: 'Bungalow Suite', price: 1100, capacity: 3, description: 'Private pink bungalow' },
      { type: 'Presidential Bungalow', price: 2200, capacity: 4, description: 'Two-bedroom private estate' },
    ],
    latitude: 34.0901, longitude: -118.4065, is_active: true,
  },
  {
    id: 'hotel-012',
    name: 'Barcelona Art Hotel',
    city: 'Barcelona',
    country: 'Spain',
    description: 'A masterpiece of contemporary architecture inspired by Gaudí, blending bold art installations with luxurious comfort near Las Ramblas.',
    address: 'Passeig de Gràcia 38, 08007 Barcelona',
    rating: 4.5,
    price_per_night: 220,
    amenities: ['Rooftop Pool', 'Free WiFi', 'Art Gallery', 'Restaurant', 'Bar', 'Spa', 'Fitness Center'],
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    ],
    room_types: [
      { type: 'Art Room', price: 220, capacity: 2, description: 'Artistically designed modern room' },
      { type: 'Gaudí Suite', price: 380, capacity: 3, description: 'Inspired by Gaudí\'s organic forms' },
    ],
    latitude: 41.3851, longitude: 2.1734, is_active: true,
  },
  {
    id: 'hotel-013',
    name: 'Bali Jungle Eco Resort',
    city: 'Bali',
    country: 'Indonesia',
    description: "An enchanting eco-resort hidden within Bali's sacred rice terraces and lush jungle, offering yoga retreats, traditional healing, and sustainable luxury.",
    address: 'Tegallalang, Ubud, Bali 80561, Indonesia',
    rating: 4.7,
    price_per_night: 180,
    amenities: ['Yoga Studio', 'Infinity Pool', 'Free WiFi', 'Spa', 'Organic Restaurant', 'Meditation', 'Rice Terrace Views'],
    images: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800',
    ],
    room_types: [
      { type: 'Jungle Villa', price: 180, capacity: 2, description: 'Private villa amid rice terraces' },
      { type: 'Treehouse Suite', price: 280, capacity: 2, description: 'Elevated treehouse with jungle views' },
      { type: 'Royal Rice Suite', price: 450, capacity: 4, description: 'Largest villa with private pool' },
    ],
    latitude: -8.3405, longitude: 115.2128, is_active: true,
  },
  {
    id: 'hotel-014',
    name: 'Cape Town Clifton View',
    city: 'Cape Town',
    country: 'South Africa',
    description: 'A stunning boutique hotel set against Table Mountain with sweeping Atlantic Ocean views, private beach access, and superb South African cuisine.',
    address: 'Clifton, Cape Town, 8005, South Africa',
    rating: 4.6,
    price_per_night: 260,
    amenities: ['Ocean Views', 'Pool', 'Free WiFi', 'Restaurant', 'Bar', 'Beach Access', 'Concierge'],
    images: [
      'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
      'https://images.unsplash.com/photo-1596436867294-1ee46f7f8ad3?w=800',
    ],
    room_types: [
      { type: 'Mountain View Room', price: 260, capacity: 2, description: 'Room with Table Mountain backdrop' },
      { type: 'Ocean Suite', price: 420, capacity: 3, description: 'Panoramic Atlantic Ocean views' },
    ],
    latitude: -33.9249, longitude: 18.4241, is_active: true,
  },
  {
    id: 'hotel-015',
    name: 'Chicago Lakefront Grand',
    city: 'Chicago',
    country: 'USA',
    description: 'A sleek architectural gem on the shores of Lake Michigan, offering spectacular skyline views, world-class dining, and a prime location near Millennium Park.',
    address: '333 N Michigan Ave, Chicago, IL 60601',
    rating: 4.5,
    price_per_night: 270,
    amenities: ['Lake Views', 'Pool', 'Free WiFi', 'Spa', 'Restaurant', 'Bar', 'Fitness Center', 'Concierge'],
    images: [
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
    ],
    room_types: [
      { type: 'City View Room', price: 270, capacity: 2, description: 'Stunning Chicago skyline views' },
      { type: 'Lake Suite', price: 450, capacity: 3, description: 'Panoramic Lake Michigan suite' },
    ],
    latitude: 41.8827, longitude: -87.6233, is_active: true,
  },
  {
    id: 'hotel-016',
    name: 'Kyoto Traditional Ryokan',
    city: 'Kyoto',
    country: 'Japan',
    description: 'An authentic Japanese inn (ryokan) in the historic Gion district, where geishas still walk the lantern-lit streets at dusk, offering kaiseki dining.',
    address: 'Gion, Higashiyama-ku, Kyoto 605-0073',
    rating: 4.8,
    price_per_night: 320,
    amenities: ['Onsen Bath', 'Kaiseki Dinner', 'Free WiFi', 'Tea Ceremony', 'Yukata', 'Garden', 'Concierge'],
    images: [
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    ],
    room_types: [
      { type: 'Traditional Room', price: 320, capacity: 2, description: 'Classic tatami room with futon' },
      { type: 'Garden Suite', price: 520, capacity: 2, description: 'Private suite with garden views' },
    ],
    latitude: 35.0116, longitude: 135.7681, is_active: true,
  },
  {
    id: 'hotel-017',
    name: 'Rio de Janeiro Sugarloaf',
    city: 'Rio de Janeiro',
    country: 'Brazil',
    description: 'A vibrant beachside luxury hotel steps from Copacabana Beach, with views of Sugarloaf Mountain, samba shows, and the iconic carioca lifestyle.',
    address: 'Av. Atlântica 1702, Copacabana, Rio de Janeiro',
    rating: 4.4,
    price_per_night: 195,
    amenities: ['Beachfront', 'Pool', 'Free WiFi', 'Restaurant', 'Bar', 'Samba Shows', 'Fitness Center'],
    images: [
      'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=800',
      'https://images.unsplash.com/photo-1597968070016-11e3ca0f2a11?w=800',
    ],
    room_types: [
      { type: 'Copacabana Room', price: 195, capacity: 2, description: 'Room overlooking the famous beach' },
      { type: 'Ocean Suite', price: 320, capacity: 3, description: 'Panoramic Atlantic views' },
    ],
    latitude: -22.9712, longitude: -43.1861, is_active: true,
  },
  {
    id: 'hotel-018',
    name: 'Sydney Harbour View',
    city: 'Sydney',
    country: 'Australia',
    description: 'Located in the iconic Circular Quay, offering direct views of the Sydney Opera House and Harbour Bridge from every room, with award-winning seafood.',
    address: '1 Circular Quay West, Sydney NSW 2000',
    rating: 4.7,
    price_per_night: 390,
    amenities: ['Harbour Views', 'Pool', 'Free WiFi', 'Fine Dining', 'Bar', 'Spa', 'Concierge'],
    images: [
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
      'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800',
    ],
    room_types: [
      { type: 'Opera House View', price: 390, capacity: 2, description: 'Direct Opera House views' },
      { type: 'Harbour Suite', price: 650, capacity: 3, description: 'Panoramic harbour panorama suite' },
    ],
    latitude: -33.8688, longitude: 151.2093, is_active: true,
  },
  {
    id: 'hotel-019',
    name: 'Amsterdam Canal House',
    city: 'Amsterdam',
    country: 'Netherlands',
    description: 'Five elegantly restored 17th-century canal houses combined into one exquisite boutique hotel, blending Dutch Golden Age heritage with modern luxury.',
    address: 'Herengracht 341, 1016 AZ Amsterdam',
    rating: 4.6,
    price_per_night: 245,
    amenities: ['Canal Views', 'Free WiFi', 'Breakfast', 'Bar', 'Concierge', 'Bicycle Rental'],
    images: [
      'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
      'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800',
    ],
    room_types: [
      { type: 'Canal Room', price: 245, capacity: 2, description: 'Charming room overlooking the canal' },
      { type: 'Heritage Suite', price: 390, capacity: 3, description: 'Suite with original period features' },
    ],
    latitude: 52.3702, longitude: 4.8952, is_active: true,
  },
  {
    id: 'hotel-020',
    name: 'Mumbai Taj Palace',
    city: 'Mumbai',
    country: 'India',
    description: 'The crown jewel of Indian hospitality since 1903, offering regal rooms, eleven restaurants and bars, and a breathtaking view of the Gateway of India.',
    address: 'Apollo Bunder, Mumbai, Maharashtra 400001',
    rating: 4.8,
    price_per_night: 280,
    amenities: ['Pool', 'Spa', 'Free WiFi', 'Fine Dining', 'Concierge', 'Heritage Tours', 'Bar', 'Fitness Center'],
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
    ],
    room_types: [
      { type: 'Heritage Room', price: 280, capacity: 2, description: 'Classic room in the historic wing' },
      { type: 'Sea View Suite', price: 480, capacity: 3, description: 'Suite overlooking the Gateway of India' },
      { type: 'Grand Presidential Suite', price: 1500, capacity: 6, description: 'The most prestigious suite in India' },
    ],
    latitude: 18.9217, longitude: 72.8334, is_active: true,
  },
];

export const hotelService = {
  seedHotels(): void {
    const count = hotelModel.count();
    if (count === 0) {
      SEED_HOTELS.forEach((h) => hotelModel.upsert(h));
      console.log(`✅ Seeded ${SEED_HOTELS.length} hotels`);
    }
  },

  getAllHotels(): HotelParsed[] {
    return hotelModel.findAll();
  },

  getHotelById(id: string): HotelParsed | undefined {
    return hotelModel.findById(id);
  },

  searchHotels(params: {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    guests?: number;
    checkIn?: string;
    checkOut?: string;
  }): HotelParsed[] {
    return hotelModel.search(params);
  },
};
