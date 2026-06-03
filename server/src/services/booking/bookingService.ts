import { bookingModel, Booking, BookingWithHotel } from '../../models/bookingModel';
import { hotelModel } from '../../models/hotelModel';
import { generateBookingId } from '../../utils/idGenerator';
import { createError } from '../../middleware/errorHandler';

export interface CreateBookingInput {
  userId: string;
  hotelId: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests?: string;
}

export interface ModifyBookingInput {
  bookingId: string;
  userId: string;
  roomType?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  specialRequests?: string;
}

function calculateNights(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diff = outDate.getTime() - inDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export const bookingService = {
  async createBooking(input: CreateBookingInput): Promise<Booking> {
    const hotel = hotelModel.findById(input.hotelId);
    if (!hotel) throw createError('Hotel not found', 404);

    const room = hotel.room_types.find((r) => r.type === input.roomType);
    if (!room) throw createError(`Room type "${input.roomType}" not found`, 400);

    if (input.guests > room.capacity) {
      throw createError(`Room capacity is ${room.capacity} guests`, 400);
    }

    const nights = calculateNights(input.checkIn, input.checkOut);
    if (nights <= 0) throw createError('Check-out must be after check-in', 400);

    const totalPrice = room.price * nights;
    const id = generateBookingId();

    return bookingModel.create({
      id,
      user_id: input.userId,
      hotel_id: input.hotelId,
      room_type: input.roomType,
      check_in: input.checkIn,
      check_out: input.checkOut,
      guests: input.guests,
      total_price: totalPrice,
      status: 'confirmed',
      special_requests: input.specialRequests,
    });
  },

  async modifyBooking(input: ModifyBookingInput): Promise<Booking> {
    const booking = bookingModel.findById(input.bookingId);
    if (!booking) throw createError('Booking not found', 404);
    if (booking.user_id !== input.userId) throw createError('Unauthorized', 403);
    if (booking.status === 'cancelled') throw createError('Cannot modify a cancelled booking', 400);

    const hotel = hotelModel.findById(booking.hotel_id);
    if (!hotel) throw createError('Hotel not found', 404);

    const roomType = input.roomType || booking.room_type;
    const room = hotel.room_types.find((r) => r.type === roomType);
    if (!room) throw createError(`Room type "${roomType}" not found`, 400);

    const checkIn = input.checkIn || booking.check_in;
    const checkOut = input.checkOut || booking.check_out;
    const guests = input.guests ?? booking.guests;

    if (guests > room.capacity) throw createError(`Room capacity is ${room.capacity}`, 400);

    const nights = calculateNights(checkIn, checkOut);
    if (nights <= 0) throw createError('Check-out must be after check-in', 400);

    const totalPrice = room.price * nights;

    const updated = bookingModel.update(input.bookingId, {
      room_type: roomType,
      check_in: checkIn,
      check_out: checkOut,
      guests,
      total_price: totalPrice,
      status: 'modified',
      special_requests: input.specialRequests ?? booking.special_requests,
    });

    if (!updated) throw createError('Failed to update booking', 500);
    return updated;
  },

  async cancelBooking(bookingId: string, userId: string): Promise<Booking> {
    const booking = bookingModel.findById(bookingId);
    if (!booking) throw createError('Booking not found', 404);
    if (booking.user_id !== userId) throw createError('Unauthorized', 403);
    if (booking.status === 'cancelled') throw createError('Booking is already cancelled', 400);

    const cancelled = bookingModel.cancel(bookingId);
    if (!cancelled) throw createError('Failed to cancel booking', 500);
    return cancelled;
  },

  getUserBookings(userId: string): BookingWithHotel[] {
    return bookingModel.findByUser(userId);
  },

  getBookingById(id: string): Booking | undefined {
    return bookingModel.findById(id);
  },

  getAllBookings(limit?: number, offset?: number): BookingWithHotel[] {
    return bookingModel.findAll(limit, offset);
  },
};
