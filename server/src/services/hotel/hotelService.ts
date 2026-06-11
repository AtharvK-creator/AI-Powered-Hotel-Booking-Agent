import { hotelModel, HotelParsed } from '../../models/hotelModel';

// 20 simulated Indian hotels with rich luxury data
const SEED_HOTELS: HotelParsed[] = [
  {
    id: 'hotel-001',
    name: 'The Taj Mahal Palace',
    city: 'Mumbai',
    country: 'India',
    description: 'The crown jewel of Indian hospitality since 1903, offering regal rooms, legendary dining, and panoramic views of the Gateway of India and the Arabian Sea.',
    address: 'Apollo Bunder, Colaba, Mumbai, Maharashtra 400001',
    rating: 4.9,
    price_per_night: 350,
    amenities: ['Arabian Sea Views', 'Spa', 'Pool', 'Fine Dining', 'Concierge', 'Heritage Tour', 'Butler Service', 'Bar'],
    images: [
      'https://images.unsplash.com/photo-1598977123418-45f04b615e37?w=800',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
    ],
    room_types: [
      { type: 'Luxury Room', price: 350, capacity: 2, description: 'Elegant heritage room with city views' },
      { type: 'Taj Club Suite', price: 650, capacity: 3, description: 'Spacious suite with lounge access and butler service' },
      { type: 'Grand Presidential Suite', price: 2000, capacity: 4, description: 'The pinnacle of regal Indian luxury' },
    ],
    latitude: 18.9217, longitude: 72.8334, is_active: true,
  },
  {
    id: 'hotel-002',
    name: 'The Leela Palace',
    city: 'New Delhi',
    country: 'India',
    description: 'An architectural marvel blending Lutyens design with traditional Indian palaces, featuring royal suites, Michelin-star dining, and a rooftop pool.',
    address: 'Diplomatic Enclave, Chanakyapuri, New Delhi, Delhi 110023',
    rating: 4.8,
    price_per_night: 280,
    amenities: ['Rooftop Pool', 'Spa', 'Free WiFi', 'Michelin Dining', 'Concierge', 'Valet Parking', 'Bar', 'Gym'],
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    ],
    room_types: [
      { type: 'Grande Room', price: 280, capacity: 2, description: 'Spacious room with plush marble bathroom' },
      { type: 'Royal Club Suite', price: 500, capacity: 3, description: 'Suite with private lounge access' },
    ],
    latitude: 28.5835, longitude: 77.1953, is_active: true,
  },
  {
    id: 'hotel-003',
    name: 'Rambagh Palace',
    city: 'Jaipur',
    country: 'India',
    description: 'The former residence of the Maharaja of Jaipur, offering a royal experience with horse-drawn carriages, resident peacocks, and exquisite heritage suites.',
    address: 'Bhawani Singh Road, Jaipur, Rajasthan 302005',
    rating: 4.9,
    price_per_night: 420,
    amenities: ['Royal Gardens', 'Spa', 'Peacock Viewing', 'Pool', 'Fine Dining', 'Bar', 'Historic Carriage Ride'],
    images: [
      'https://images.unsplash.com/photo-1585983224974-084a8e065e76?w=800',
      'https://images.unsplash.com/photo-1546412414-e188526119af?w=800',
    ],
    room_types: [
      { type: 'Palace Room', price: 420, capacity: 2, description: 'Regal room decorated with historic artifacts' },
      { type: 'Historical Suite', price: 800, capacity: 3, description: 'Authentic maharaja chambers' },
    ],
    latitude: 26.8981, longitude: 75.8083, is_active: true,
  },
  {
    id: 'hotel-004',
    name: 'Taj Lake Palace',
    city: 'Udaipur',
    country: 'India',
    description: 'An iconic white marble palace floating majestically on the waters of Lake Pichola, offering scenic sunset cruises and world-class heritage service.',
    address: 'Pichola Lake, Udaipur, Rajasthan 313001',
    rating: 4.9,
    price_per_night: 490,
    amenities: ['Lake Views', 'Floating Spa', 'Sunset Cruise', 'Pool', 'Butler Service', 'Royal Dining', 'Bar'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1602002418082-a4443978a5d9?w=800',
    ],
    room_types: [
      { type: 'Luxury Lake View Room', price: 490, capacity: 2, description: 'Room overlooking Lake Pichola and City Palace' },
      { type: 'Royal Suite', price: 950, capacity: 3, description: 'Decorated with crystal panels and stained glass' },
    ],
    latitude: 24.5756, longitude: 73.6800, is_active: true,
  },
  {
    id: 'hotel-005',
    name: 'The Oberoi Udaivilas',
    city: 'Udaipur',
    country: 'India',
    description: 'A breathtaking resort on the banks of Lake Pichola, showcasing traditional Mewari design, sprawling courtyards, and semi-private pool access rooms.',
    address: 'Haridasji Ki Magri, Udaipur, Rajasthan 313001',
    rating: 4.9,
    price_per_night: 410,
    amenities: ['Infinity Pools', 'Spa', 'Free WiFi', 'Lakeside Dining', 'Gym', 'Heritage Architecture', 'Bar'],
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    ],
    room_types: [
      { type: 'Premier Room', price: 410, capacity: 2, description: 'Premier garden view room' },
      { type: 'Semi Private Pool Room', price: 680, capacity: 3, description: 'Direct access to the semi-private pool' },
    ],
    latitude: 24.5768, longitude: 73.6685, is_active: true,
  },
  {
    id: 'hotel-006',
    name: 'Taj Exotica Resort & Spa',
    city: 'Goa',
    country: 'India',
    description: 'A Mediterranean-style paradise set in 56 acres of lush gardens along Benaulim Beach, offering golf courses, a luxurious Jiva Spa, and ocean views.',
    address: 'Calwaddo, Benaulim, Salcete, Goa 403716',
    rating: 4.8,
    price_per_night: 220,
    amenities: ['Beachfront', 'Golf Course', 'Jiva Spa', 'Pool', 'Free WiFi', 'Activities', 'Ocean Dining', 'Bar'],
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
    ],
    room_types: [
      { type: 'Villa Garden View', price: 220, capacity: 2, description: 'Charming villa room with garden views' },
      { type: 'Indulgence Villa Private Pool', price: 450, capacity: 3, description: 'Exclusive villa with a private plunge pool' },
    ],
    latitude: 15.2472, longitude: 73.9213, is_active: true,
  },
  {
    id: 'hotel-007',
    name: 'The Oberoi Amarvilas',
    city: 'Agra',
    country: 'India',
    description: 'An unmatched luxury hotel located just 600 meters from the Taj Mahal, with breathtaking, unobstructed views of the monument from every room.',
    address: 'Taj East Gate Road, Agra, Uttar Pradesh 282001',
    rating: 4.9,
    price_per_night: 390,
    amenities: ['Taj Mahal Views', 'Pool', 'Spa', 'Free WiFi', 'Fine Dining', 'Concierge', 'Bar', 'Gym'],
    images: [
      'https://images.unsplash.com/photo-1564507592937-25994a9015b2?w=800',
      'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=800',
    ],
    room_types: [
      { type: 'Premier Taj View', price: 390, capacity: 2, description: 'Premier room with uninterrupted view of the Taj Mahal' },
      { type: 'Deluxe Taj View Suite', price: 790, capacity: 3, description: 'Deluxe suite with private balcony and Taj views' },
    ],
    latitude: 27.1682, longitude: 78.0573, is_active: true,
  },
  {
    id: 'hotel-008',
    name: 'Wildflower Hall',
    city: 'Shimla',
    country: 'India',
    description: 'A majestic mountain sanctuary situated 8,250 feet in the Himalayas, offering heated pools, cedar forest trails, and panoramic snow-capped peak views.',
    address: 'Shimla Kufri Highway, Chharabra, Shimla, Himachal Pradesh 171012',
    rating: 4.8,
    price_per_night: 290,
    amenities: ['Mountain Views', 'Indoor Pool', 'Outdoor Jacuzzi', 'Spa', 'Trekking', 'Fine Dining', 'Fireplace Bar'],
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    ],
    room_types: [
      { type: 'Deluxe Garden Room', price: 290, capacity: 2, description: 'Room looking out onto cedar forests' },
      { type: 'Premier Valley View', price: 420, capacity: 2, description: 'Premium room with sweeping valley views' },
      { type: 'Lord Kitchener Suite', price: 900, capacity: 3, description: 'Grand heritage suite with fireplace' },
    ],
    latitude: 31.1048, longitude: 77.2343, is_active: true,
  },
  {
    id: 'hotel-009',
    name: 'The Leela Palace',
    city: 'Bengaluru',
    country: 'India',
    description: 'Set in nine acres of lush gardens, this palace hotel showcases ornate arches, copper domes, and gold leaf artwork in the tech capital.',
    address: '23 Old Airport Road, HAL 2nd Stage, Bengaluru, Karnataka 560008',
    rating: 4.7,
    price_per_night: 200,
    amenities: ['Pool', 'Spa', 'Free WiFi', 'Royal Gardens', 'Gym', 'Award-Winning Restaurants', 'Bar'],
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800',
    ],
    room_types: [
      { type: 'Deluxe Room', price: 200, capacity: 2, description: 'Charming modern room overlooking gardens' },
      { type: 'Executive Suite', price: 380, capacity: 3, description: 'Luxury suite with separate living area' },
    ],
    latitude: 12.9611, longitude: 77.6483, is_active: true,
  },
  {
    id: 'hotel-010',
    name: 'Kumarakom Lake Resort',
    city: 'Kochi',
    country: 'India',
    description: 'A luxury heritage resort nestled in the backwaters of Kerala, featuring restored 16th-century ancestral homes, meandering pools, and houseboat dining.',
    address: 'Kottayam-Kumarakom Road, Kumarakom, Kerala 686563',
    rating: 4.8,
    price_per_night: 240,
    amenities: ['Meandering Pool', 'Backwater Views', 'Ayurveda Spa', 'Houseboat Cruises', 'Free WiFi', 'Seafood Dining'],
    images: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
      'https://images.unsplash.com/photo-1602002418082-a4443978a5d9?w=800',
    ],
    room_types: [
      { type: 'Pavilion Room', price: 240, capacity: 2, description: 'Heritage pavilion room with courtyard' },
      { type: 'Meandering Pool Villa', price: 390, capacity: 2, description: 'Duplex villa with direct access to 250m pool' },
      { type: 'Luxury Houseboat', price: 600, capacity: 4, description: 'Private floating luxury boat' },
    ],
    latitude: 9.5916, longitude: 76.4227, is_active: true,
  },
  {
    id: 'hotel-011',
    name: 'Taj Nadesar Palace',
    city: 'Varanasi',
    country: 'India',
    description: 'A historic palace set among marigold fields, jasmine gardens, and mango orchards, providing sanctuary near the sacred Ganges River.',
    address: 'Nadesar Palace Grounds, Varanasi, Uttar Pradesh 221002',
    rating: 4.9,
    price_per_night: 310,
    amenities: ['Palace Gardens', 'Jiva Spa', 'Pool', 'Ganga Aarti Guide', 'Horse Carriage', 'Fine Dining', 'Free WiFi'],
    images: [
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800',
      'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=800',
    ],
    room_types: [
      { type: 'Palace Room', price: 310, capacity: 2, description: 'Classic regal room with high ceilings' },
      { type: 'Royal Suite', price: 590, capacity: 3, description: 'Historic suite featuring antique art' },
    ],
    latitude: 25.3267, longitude: 82.9876, is_active: true,
  },
  {
    id: 'hotel-012',
    name: 'Umaid Bhawan Palace',
    city: 'Jodhpur',
    country: 'India',
    description: 'One of the world\'s largest private residences, built in golden sandstone with art deco interiors, resident peacocks, and award-winning palace tours.',
    address: 'Circuit House Road, Jodhpur, Rajasthan 342006',
    rating: 4.9,
    price_per_night: 460,
    amenities: ['Palace Museum', 'Peacock Gardens', 'Pool', 'Jiva Spa', 'Fine Dining', 'Vintage Car Tour', 'Bar'],
    images: [
      'https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=800',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    ],
    room_types: [
      { type: 'Palace Room', price: 460, capacity: 2, description: 'Art deco room with courtyard view' },
      { type: 'Historical Suite', price: 850, capacity: 3, description: 'Suite once occupied by royal guests' },
    ],
    latitude: 26.2807, longitude: 73.0441, is_active: true,
  },
  {
    id: 'hotel-013',
    name: 'Taj Falaknuma Palace',
    city: 'Hyderabad',
    country: 'India',
    description: 'A spectacular palace 2,000 feet above Hyderabad, with horse-drawn carriage arrivals, Venetian chandeliers, and the legendary 101-seat dining table.',
    address: 'Engine Bowli, Falaknuma, Hyderabad, Telangana 500053',
    rating: 4.9,
    price_per_night: 400,
    amenities: ['Hilltop View', 'Carriage Arrival', 'Pool', 'Spa', 'Royal Library', '101 Dining Table', 'Concierge', 'Bar'],
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800',
    ],
    room_types: [
      { type: 'Palace Room', price: 400, capacity: 2, description: 'Ornate room decorated with classic tapestries' },
      { type: 'Historical Suite', price: 720, capacity: 3, description: 'Lavish suite overlooking the palace gardens' },
    ],
    latitude: 17.3315, longitude: 78.4678, is_active: true,
  },
  {
    id: 'hotel-014',
    name: 'The Khyber Himalayan Resort',
    city: 'Gulmarg',
    country: 'India',
    description: 'A world-class ski resort in the snow-covered pine forests of Gulmarg, featuring pine-clad interiors, indoor heated pools, and direct gondola ski access.',
    address: 'Hotel Khyber Road, Gulmarg, Jammu and Kashmir 193403',
    rating: 4.8,
    price_per_night: 230,
    amenities: ['Ski Access', 'Indoor Heated Pool', 'Spa', 'Mountain Views', 'Free WiFi', 'Activity Club', 'Fine Dining'],
    images: [
      'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?w=800',
      'https://images.unsplash.com/photo-1596436867294-1ee46f7f8ad3?w=800',
    ],
    room_types: [
      { type: 'Premier Pine Room', price: 230, capacity: 2, description: 'Warm pine-clad room looking at mountain peaks' },
      { type: 'Khyber Suite', price: 410, capacity: 4, description: 'Spacious suite with valley panoramas' },
    ],
    latitude: 34.0483, longitude: 74.3805, is_active: true,
  },
  {
    id: 'hotel-015',
    name: 'ITC Grand Chola',
    city: 'Chennai',
    country: 'India',
    description: 'A monument to the golden age of the Chola Dynasty, featuring hand-carved marble columns, grand entryways, and 10 signature dining destinations.',
    address: '63 Mount Road, Guindy, Chennai, Tamil Nadu 600032',
    rating: 4.7,
    price_per_night: 170,
    amenities: ['Pools', 'Spa', 'Free WiFi', 'Heritage Tour', 'Chola Architecture', 'Luxury Dining', 'Fitness Center', 'Bar'],
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
    ],
    room_types: [
      { type: 'Executive Club', price: 170, capacity: 2, description: 'Modern club room with local touches' },
      { type: 'Eva Room (Female Only)', price: 190, capacity: 2, description: 'Dedicated rooms with special security and amenities' },
      { type: 'Chola Suite', price: 320, capacity: 3, description: 'Stately suite with butler service' },
    ],
    latitude: 13.0116, longitude: 80.2205, is_active: true,
  },
  {
    id: 'hotel-016',
    name: 'The Oberoi',
    city: 'New Delhi',
    country: 'India',
    description: 'Clean-air technology, contemporary luxury, and superb service overlooking the Delhi Golf Club and the heritage tomb of Humayun.',
    address: 'Dr. Zakir Hussain Marg, New Delhi, Delhi 110003',
    rating: 4.8,
    price_per_night: 250,
    amenities: ['Golf Course Views', 'Clean Air System', 'Pools', 'Spa', 'Rooftop Bar', 'Fine Dining', 'Concierge'],
    images: [
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    ],
    room_types: [
      { type: 'Premier Room', price: 250, capacity: 2, description: 'Contemporary room with large picture windows' },
      { type: 'Deluxe Suite', price: 490, capacity: 3, description: 'Suite overlooking Humayun\'s Tomb' },
    ],
    latitude: 28.6015, longitude: 77.2385, is_active: true,
  },
  {
    id: 'hotel-017',
    name: 'Taj Fort Aguada Resort',
    city: 'Goa',
    country: 'India',
    description: 'Goa\'s first luxury resort, built inside a historic 16th-century Portuguese fort, offering seaside villas, adventure sports, and beachfront pools.',
    address: 'Sinquerim, Candolim, Bardez, Goa 403515',
    rating: 4.6,
    price_per_night: 210,
    amenities: ['Sea Views', 'Historic Fort Location', 'Pool', 'Spa', 'Free WiFi', 'Water Sports', 'Seaside Dining'],
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
      'https://images.unsplash.com/photo-1597968070016-11e3ca0f2a11?w=800',
    ],
    room_types: [
      { type: 'Superior Sea View', price: 210, capacity: 2, description: 'Room with balcony looking at Arabian Sea' },
      { type: 'Hermitage Villa Private Lawn', price: 490, capacity: 4, description: 'Private villa with seaside lawn' },
    ],
    latitude: 15.4981, longitude: 73.7667, is_active: true,
  },
  {
    id: 'hotel-018',
    name: 'Evolve Back Kabini',
    city: 'Mysore',
    country: 'India',
    description: 'A safari resort inspired by local tribal villages, situated on the edge of the Kabini River, offering pool huts, wildlife safaris, and stargazing.',
    address: 'Bheeramballi, H D Kote Taluk, Kabini, Karnataka 571116',
    rating: 4.8,
    price_per_night: 320,
    amenities: ['River Safari', 'Pool Hut', 'Ayurveda Spa', 'Infinity Pool', 'Free WiFi', 'Fine Dining', 'Wildlife Tours'],
    images: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
      'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800',
    ],
    room_types: [
      { type: 'Safari Hut', price: 320, capacity: 2, description: 'Hut with jacuzzis and local architecture' },
      { type: 'Pool Hut', price: 540, capacity: 3, description: 'Tribal-style hut with private pool' },
    ],
    latitude: 11.9682, longitude: 76.2753, is_active: true,
  },
  {
    id: 'hotel-019',
    name: 'Brunton Boatyard',
    city: 'Kochi',
    country: 'India',
    description: 'A boutique heritage hotel built on a 19th-century Victorian shipyard in Fort Kochi, blending Portuguese, Dutch, and British colonial influences.',
    address: '1/498, Calvathy Road, Fort Kochi, Kochi, Kerala 682001',
    rating: 4.6,
    price_per_night: 160,
    amenities: ['Colonial Style', 'Sea Views', 'Pool', 'Free WiFi', 'Heritage Cuisine', 'Boat Cruise', 'Bicycle Tours'],
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800',
    ],
    room_types: [
      { type: 'Standard Sea Face', price: 160, capacity: 2, description: 'Colonial style room facing Cochin harbour' },
      { type: 'Duplex Suite', price: 290, capacity: 3, description: 'Spacious duplex suite with heritage art' },
    ],
    latitude: 9.9678, longitude: 76.2415, is_active: true,
  },
  {
    id: 'hotel-020',
    name: 'Mary Budden Estate',
    city: 'Almora',
    country: 'India',
    description: 'A private heritage estate hidden deep inside the Binsar Wildlife Sanctuary in the Himalayas, offering cozy wood-fired cottages and serene pine trails.',
    address: 'Binsar Wildlife Sanctuary, Almora, Uttarakhand 263601',
    rating: 4.9,
    price_per_night: 260,
    amenities: ['Mountain Retreat', 'Wildlife Sanctuary', 'Wood Fireplace', 'Fine Organic Dining', 'Trekking', 'Serene Gardens', 'Free WiFi'],
    images: [
      'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800',
      'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
    ],
    room_types: [
      { type: 'Estate Cottage', price: 260, capacity: 2, description: 'Cozy cottage room with fireplace' },
      { type: 'Heritage Lodge Suite', price: 420, capacity: 4, description: 'Spacious historic suite with private terrace' },
    ],
    latitude: 29.5971, longitude: 79.6591, is_active: true,
  },
];

const PRIMARY_IDS = [
  'photo-1566073771259-6a8506099945',
  'photo-1542314831-068cd1dbfeeb',
  'photo-1571896349842-33c89424de2d',
  'photo-1520250497591-112f2f40a3f4',
  'photo-1551882547-ff40c63fe5fa',
  'photo-1507525428034-b723cf961d3e',
  'photo-1582719508461-905c673771fd',
  'photo-1582719478250-c89cae4dc85b',
  'photo-1590490360182-c33d57733427',
  'photo-1618773928121-c32242e63f39',
  'photo-1566665797739-1674de7a421a',
  'photo-1596394516093-501ba68a0ba6',
  'photo-1576013551627-0cc20b96c2a7',
  'photo-1606046604972-77cc76aee944',
  'photo-1561501900-3701fa6a0864',
  'photo-1584132967334-10e028bd69f7',
  'photo-1544025162-d76694265947',
  'photo-1414235077428-338989a2e8c0',
  'photo-1550966871-3ed3cdb5ed0c',
  'photo-1517248135467-4c7edcad34c4'
];

const LOBBY_IDS = [
  'photo-1566073771259-6a8506099945',
  'photo-1542314831-068cd1dbfeeb',
  'photo-1571896349842-33c89424de2d',
  'photo-1590490360182-c33d57733427',
  'photo-1444201983204-c43cbd584d93',
];
const ROOM_IDS = [
  'photo-1618773928121-c32242e63f39',
  'photo-1611891404114-50908103347a',
  'photo-1566665797739-1674de7a421a',
  'photo-1582719478250-c89cae4dc85b',
  'photo-1596394516093-501ba68a0ba6',
];
const POOL_IDS = [
  'photo-1576013551627-0cc20b96c2a7',
  'photo-1571003123894-1f0594d2b5d9',
  'photo-1606046604972-77cc76aee944',
  'photo-1561501900-3701fa6a0864',
  'photo-1584132967334-10e028bd69f7',
];
const DINING_IDS = [
  'photo-1544025162-d76694265947',
  'photo-1414235077428-338989a2e8c0',
  'photo-1550966871-3ed3cdb5ed0c',
  'photo-1555396273-367ea4eb4db5',
  'photo-1517248135467-4c7edcad34c4',
];

export const hotelService = {
  seedHotels(): void {
    // Force seeding/upserting to overwrite and update the DB to consist of luxury Indian hotels
    SEED_HOTELS.forEach((h, index) => {
      const primaryImg1 = `https://images.unsplash.com/${PRIMARY_IDS[index % PRIMARY_IDS.length]}?auto=format&fit=crop&w=1200&q=80`;
      const primaryImg2 = `https://images.unsplash.com/${PRIMARY_IDS[(index + 1) % PRIMARY_IDS.length]}?auto=format&fit=crop&w=1200&q=80`;
      const lobbyImg = `https://images.unsplash.com/${LOBBY_IDS[index % LOBBY_IDS.length]}?auto=format&fit=crop&w=1200&q=80`;
      const roomImg = `https://images.unsplash.com/${ROOM_IDS[index % ROOM_IDS.length]}?auto=format&fit=crop&w=1200&q=80`;
      const poolImg = `https://images.unsplash.com/${POOL_IDS[index % POOL_IDS.length]}?auto=format&fit=crop&w=1200&q=80`;
      const diningImg = `https://images.unsplash.com/${DINING_IDS[index % DINING_IDS.length]}?auto=format&fit=crop&w=1200&q=80`;

      // Merge unique images, filtering out any duplicates
      const uniqueImages = Array.from(new Set([
        primaryImg1,
        primaryImg2,
        lobbyImg,
        roomImg,
        poolImg,
        diningImg
      ]));

      hotelModel.upsert({
        ...h,
        images: uniqueImages
      });
    });
    console.log(`✅ Seeded/Updated ${SEED_HOTELS.length} luxury Indian hotels with extended images`);
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
