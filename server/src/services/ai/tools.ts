import { hotelService } from '../hotel/hotelService';
import { bookingService } from '../booking/bookingService';
import { userModel } from '../../models/userModel';
import { emailService } from '../email/emailService';
import { hotelModel } from '../../models/hotelModel';

// ─── Tool Definitions (OpenAI function-calling schema) ───────────────────────

export const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'searchHotels',
      description: 'Search for available hotels based on city, budget, rating, dates, and number of guests.',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'City name to search hotels in' },
          minPrice: { type: 'number', description: 'Minimum price per night in USD' },
          maxPrice: { type: 'number', description: 'Maximum price per night in USD' },
          minRating: { type: 'number', description: 'Minimum hotel rating (1-5)' },
          guests: { type: 'number', description: 'Number of guests' },
          checkIn: { type: 'string', description: 'Check-in date (YYYY-MM-DD)' },
          checkOut: { type: 'string', description: 'Check-out date (YYYY-MM-DD)' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getHotelDetails',
      description: 'Get full details of a specific hotel including rooms, amenities, and pricing.',
      parameters: {
        type: 'object',
        properties: {
          hotelId: { type: 'string', description: 'The hotel ID' },
        },
        required: ['hotelId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'createBooking',
      description: 'Create a new hotel booking for the user. Only call this when the user explicitly confirms they want to book.',
      parameters: {
        type: 'object',
        properties: {
          hotelId: { type: 'string', description: 'Hotel ID to book' },
          roomType: { type: 'string', description: 'Room type name (must match exactly)' },
          checkIn: { type: 'string', description: 'Check-in date (YYYY-MM-DD)' },
          checkOut: { type: 'string', description: 'Check-out date (YYYY-MM-DD)' },
          guests: { type: 'number', description: 'Number of guests' },
          specialRequests: { type: 'string', description: 'Any special requests from the guest' },
        },
        required: ['hotelId', 'roomType', 'checkIn', 'checkOut', 'guests'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'modifyBooking',
      description: 'Modify an existing booking (change dates, room type, or guests).',
      parameters: {
        type: 'object',
        properties: {
          bookingId: { type: 'string', description: 'Booking ID to modify' },
          roomType: { type: 'string', description: 'New room type' },
          checkIn: { type: 'string', description: 'New check-in date (YYYY-MM-DD)' },
          checkOut: { type: 'string', description: 'New check-out date (YYYY-MM-DD)' },
          guests: { type: 'number', description: 'New number of guests' },
          specialRequests: { type: 'string', description: 'Updated special requests' },
        },
        required: ['bookingId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'cancelBooking',
      description: 'Cancel an existing booking by booking ID.',
      parameters: {
        type: 'object',
        properties: {
          bookingId: { type: 'string', description: 'The booking ID to cancel' },
        },
        required: ['bookingId'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getUserBookings',
      description: 'Retrieve all bookings for the current user.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'sendConfirmationEmail',
      description: 'Send an email notification for a booking (confirmation, modification, or cancellation).',
      parameters: {
        type: 'object',
        properties: {
          bookingId: { type: 'string', description: 'Booking ID' },
          emailType: {
            type: 'string',
            enum: ['confirmation', 'modification', 'cancellation'],
            description: 'Type of email to send',
          },
        },
        required: ['bookingId', 'emailType'],
      },
    },
  },
];

// ─── Tool Executor ────────────────────────────────────────────────────────────

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  switch (toolName) {
    case 'searchHotels': {
      const results = hotelService.searchHotels({
        city: args.city as string | undefined,
        minPrice: args.minPrice as number | undefined,
        maxPrice: args.maxPrice as number | undefined,
        minRating: args.minRating as number | undefined,
        guests: args.guests as number | undefined,
        checkIn: args.checkIn as string | undefined,
        checkOut: args.checkOut as string | undefined,
      });
      return {
        count: results.length,
        hotels: results.map((h) => ({
          id: h.id,
          name: h.name,
          city: h.city,
          country: h.country,
          rating: h.rating,
          price_per_night: h.price_per_night,
          amenities: h.amenities.slice(0, 5),
          room_types: h.room_types,
        })),
      };
    }

    case 'getHotelDetails': {
      const hotel = hotelService.getHotelById(args.hotelId as string);
      if (!hotel) return { error: 'Hotel not found' };
      return hotel;
    }

    case 'createBooking': {
      const booking = await bookingService.createBooking({
        userId,
        hotelId: args.hotelId as string,
        roomType: args.roomType as string,
        checkIn: args.checkIn as string,
        checkOut: args.checkOut as string,
        guests: args.guests as number,
        specialRequests: args.specialRequests as string | undefined,
      });

      // Auto-send confirmation email
      const user = userModel.findById(userId);
      const hotel = hotelModel.findById(booking.hotel_id);
      if (user && hotel) {
        await emailService.sendEmail({
          to: user.email,
          name: user.name,
          type: 'confirmation',
          bookingId: booking.id,
          hotelName: hotel.name,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          roomType: booking.room_type,
          totalPrice: booking.total_price,
          guests: booking.guests,
        });
      }

      return { success: true, booking };
    }

    case 'modifyBooking': {
      const booking = await bookingService.modifyBooking({
        bookingId: args.bookingId as string,
        userId,
        roomType: args.roomType as string | undefined,
        checkIn: args.checkIn as string | undefined,
        checkOut: args.checkOut as string | undefined,
        guests: args.guests as number | undefined,
        specialRequests: args.specialRequests as string | undefined,
      });

      const user = userModel.findById(userId);
      const hotel = hotelModel.findById(booking.hotel_id);
      if (user && hotel) {
        await emailService.sendEmail({
          to: user.email,
          name: user.name,
          type: 'modification',
          bookingId: booking.id,
          hotelName: hotel.name,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          roomType: booking.room_type,
          totalPrice: booking.total_price,
          guests: booking.guests,
        });
      }

      return { success: true, booking };
    }

    case 'cancelBooking': {
      const booking = await bookingService.cancelBooking(args.bookingId as string, userId);

      const user = userModel.findById(userId);
      const hotel = hotelModel.findById(booking.hotel_id);
      if (user && hotel) {
        await emailService.sendEmail({
          to: user.email,
          name: user.name,
          type: 'cancellation',
          bookingId: booking.id,
          hotelName: hotel.name,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          roomType: booking.room_type,
          totalPrice: booking.total_price,
          guests: booking.guests,
        });
      }

      return { success: true, booking };
    }

    case 'getUserBookings': {
      const bookings = bookingService.getUserBookings(userId);
      return { count: bookings.length, bookings };
    }

    case 'sendConfirmationEmail': {
      const booking = bookingService.getBookingById(args.bookingId as string);
      if (!booking) return { error: 'Booking not found' };

      const user = userModel.findById(userId);
      const hotel = hotelModel.findById(booking.hotel_id);
      if (!user || !hotel) return { error: 'User or hotel not found' };

      await emailService.sendEmail({
        to: user.email,
        name: user.name,
        type: args.emailType as 'confirmation' | 'modification' | 'cancellation',
        bookingId: booking.id,
        hotelName: hotel.name,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        roomType: booking.room_type,
        totalPrice: booking.total_price,
        guests: booking.guests,
      });

      return { success: true, message: `Email sent to ${user.email}` };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
