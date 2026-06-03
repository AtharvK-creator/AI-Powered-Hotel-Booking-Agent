import { v4 as uuidv4 } from 'uuid';

/** Generate a UUID for users, sessions, etc. */
export function generateId(): string {
  return uuidv4();
}

/** Generate a human-readable booking ID like BK-20240603-A4F2 */
export function generateBookingId(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `BK-${datePart}-${randomPart}`;
}
