import { env } from '../../config/env';

export type EmailType = 'confirmation' | 'modification' | 'cancellation';

export interface EmailPayload {
  to: string;
  name: string;
  type: EmailType;
  bookingId: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  totalPrice: number;
  guests: number;
}

const SUBJECTS: Record<EmailType, string> = {
  confirmation: '🏨 Booking Confirmed!',
  modification: '✏️ Booking Updated',
  cancellation: '❌ Booking Cancelled',
};

function buildEmailBody(payload: EmailPayload): string {
  const typeLabel =
    payload.type === 'confirmation'
      ? 'confirmed'
      : payload.type === 'modification'
      ? 'updated'
      : 'cancelled';

  return `
==============================================
  Hotel Booking AI — Email Notification
==============================================

Hello ${payload.name},

Your booking has been ${typeLabel}.

Booking Details:
  Booking ID   : ${payload.bookingId}
  Hotel        : ${payload.hotelName}
  Room Type    : ${payload.roomType}
  Check-in     : ${payload.checkIn}
  Check-out    : ${payload.checkOut}
  Guests       : ${payload.guests}
  Total Price  : $${payload.totalPrice.toFixed(2)}
  Status       : ${typeLabel.toUpperCase()}

${
  payload.type === 'cancellation'
    ? 'We hope to see you again soon!'
    : 'We look forward to hosting you. Please arrive after 3:00 PM.'
}

Thank you for choosing Hotel Booking AI.

==============================================
  [Email sent to: ${payload.to}]
==============================================
  `.trim();
}

export const emailService = {
  async sendEmail(payload: EmailPayload): Promise<void> {
    const subject = SUBJECTS[payload.type];
    const body = buildEmailBody(payload);

    if (env.emailEnabled) {
      // Real SMTP — only used when EMAIL_ENABLED=true
      try {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          host: env.smtpHost,
          port: env.smtpPort,
          auth: { user: env.smtpUser, pass: env.smtpPass },
        });

        await transporter.sendMail({
          from: env.emailFrom,
          to: payload.to,
          subject,
          text: body,
        });

        console.log(`📧 Email sent to ${payload.to}: ${subject}`);
      } catch (err) {
        console.error('Failed to send email via SMTP:', err);
      }
    } else {
      // Simulated email — logs to console
      console.log('\n' + '='.repeat(50));
      console.log(`📧 SIMULATED EMAIL`);
      console.log(`To      : ${payload.to}`);
      console.log(`Subject : ${subject}`);
      console.log('-'.repeat(50));
      console.log(body);
      console.log('='.repeat(50) + '\n');
    }
  },
};
