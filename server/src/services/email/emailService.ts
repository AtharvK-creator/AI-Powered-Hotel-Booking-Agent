import nodemailer from 'nodemailer';
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
  confirmation: 'Reservation Confirmed — AURA Luxury Hotels',
  modification: 'Reservation Updated — AURA Luxury Hotels',
  cancellation: 'Reservation Cancelled — AURA Luxury Hotels',
};

// Create Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465, // Use SSL for port 465, TLS/STARTTLS for 587
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

function buildEmailBodyText(payload: EmailPayload): string {
  const typeLabel =
    payload.type === 'confirmation'
      ? 'confirmed'
      : payload.type === 'modification'
      ? 'updated'
      : 'cancelled';

  return `
AURA LUXURY HOTELS
Reservation ${typeLabel.toUpperCase()}

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
  Status       : ${payload.type.toUpperCase()}

${
  payload.type === 'cancellation'
    ? 'We hope to see you again soon!'
    : 'We look forward to hosting you. Please arrive after 3:00 PM.'
}

Thank you for choosing AURA.
  `.trim();
}

function buildEmailBodyHtml(payload: EmailPayload): string {
  const typeLabel =
    payload.type === 'confirmation'
      ? 'Confirmed'
      : payload.type === 'modification'
      ? 'Updated'
      : 'Cancelled';

  const subject = SUBJECTS[payload.type];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #FAF8F5;
      color: #1C1917;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #FAF8F5;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #EFEFEF;
      border-radius: 2px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }
    .header {
      background-color: #0A0A0A;
      padding: 30px;
      text-align: center;
      border-bottom: 2px solid #C5A880;
    }
    .logo {
      color: #C5A880;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 24px;
      font-weight: 400;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin: 0;
    }
    .logo-sub {
      color: #8E867E;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 4px;
    }
    .content {
      padding: 40px 30px;
    }
    h1 {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 20px;
      font-weight: 400;
      color: #0A0A0A;
      margin-top: 0;
      margin-bottom: 20px;
      text-align: center;
      letter-spacing: 0.05em;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #57534E;
      margin-bottom: 25px;
    }
    .summary-card {
      background-color: #FAF8F5;
      border: 1px solid #EAE5DD;
      border-left: 3px solid #C5A880;
      padding: 20px;
      margin-bottom: 25px;
    }
    .summary-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #8E867E;
      margin-bottom: 12px;
      border-bottom: 1px solid #EAE5DD;
      padding-bottom: 4px;
    }
    .footer {
      background-color: #F3EFE9;
      padding: 20px;
      text-align: center;
      font-size: 11px;
      color: #8E867E;
      border-top: 1px solid #EAE5DD;
    }
    .footer-links {
      margin-top: 10px;
    }
    .footer-links a {
      color: #A88E64;
      text-decoration: none;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">✦ AURA</div>
        <div class="logo-sub">Luxury Hotels & Resorts</div>
      </div>
      <div class="content">
        <h1>Reservation ${typeLabel}</h1>
        <p>Dear ${payload.name},</p>
        <p>This message confirms that your reservation at <strong>${payload.hotelName}</strong> has been successfully ${typeLabel.toLowerCase()}. Below is the summary of your itinerary.</p>
        
        <div class="summary-card">
          <div class="summary-title">Itinerary Details</div>
          
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding: 6px 0; font-size:13px; color:#8E867E; font-weight:500;">Reservation ID</td>
              <td style="padding: 6px 0; font-size:13px; color:#1C1917; font-weight:600; text-align:right; font-family:monospace;">${payload.bookingId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size:13px; color:#8E867E; font-weight:500;">Hotel Destination</td>
              <td style="padding: 6px 0; font-size:13px; color:#1C1917; font-weight:600; text-align:right;">${payload.hotelName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size:13px; color:#8E867E; font-weight:500;">Room Accommodations</td>
              <td style="padding: 6px 0; font-size:13px; color:#1C1917; font-weight:600; text-align:right;">${payload.roomType}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size:13px; color:#8E867E; font-weight:500;">Arrival (Check-in)</td>
              <td style="padding: 6px 0; font-size:13px; color:#1C1917; font-weight:600; text-align:right;">${payload.checkIn}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size:13px; color:#8E867E; font-weight:500;">Departure (Check-out)</td>
              <td style="padding: 6px 0; font-size:13px; color:#1C1917; font-weight:600; text-align:right;">${payload.checkOut}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size:13px; color:#8E867E; font-weight:500;">Guest Occupancy</td>
              <td style="padding: 6px 0; font-size:13px; color:#1C1917; font-weight:600; text-align:right;">${payload.guests} Guests</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size:13px; color:#8E867E; font-weight:500;">Total Invoice</td>
              <td style="padding: 6px 0; font-size:13px; color:#A88E64; font-weight:600; text-align:right;">$${payload.totalPrice.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0 6px; font-size:13px; color:#8E867E; font-weight:500; border-top:1px solid #EAE5DD;">Status</td>
              <td style="padding: 12px 0 6px; font-size:13px; color:#C5A880; font-weight:600; text-align:right; border-top:1px solid #EAE5DD; text-transform:uppercase; letter-spacing: 0.05em;">${payload.type.toUpperCase()}</td>
            </tr>
          </table>
        </div>
        
        <p style="margin-bottom:0; font-size:13px;">
          ${
            payload.type === 'cancellation'
              ? 'Your deposit will be credited back in accordance with our cancellation policies. We hope to serve you again in the future.'
              : 'Our valet staff and concierge team look forward to hosting you. Please note that guest check-in begins at 3:00 PM.'
          }
        </p>
      </div>
      <div class="footer">
        <div>AURA Luxury Hotels · Mumbai · New Delhi · Jaipur · Udaipur · Goa</div>
        <div class="footer-links">
          <a href="#">Contact Concierge</a>
          <a href="#">Manage Reservation</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export const emailService = {
  // Verify SMTP Connection on Startup
  async verifySmtpConnection(): Promise<boolean> {
    if (!env.emailEnabled) {
      console.log('📧 Email service: SMTP is disabled (EMAIL_ENABLED=false). Using simulated logging.');
      return true;
    }

    try {
      await transporter.verify();
      console.log('📧 Email service: SMTP connection verified successfully!');
      return true;
    } catch (err) {
      console.error('📧 Email service: SMTP verification failed on startup:', err);
      return false;
    }
  },

  // Send Email (confirmed, modified, cancelled)
  async sendEmail(payload: EmailPayload): Promise<void> {
    const subject = SUBJECTS[payload.type];
    const bodyText = buildEmailBodyText(payload);
    const bodyHtml = buildEmailBodyHtml(payload);

    if (env.emailEnabled) {
      try {
        await transporter.sendMail({
          from: env.emailFrom,
          to: payload.to,
          subject,
          text: bodyText,
          html: bodyHtml,
        });
        console.log(`📧 Email delivered to ${payload.to}: ${subject}`);
      } catch (err) {
        // Log error but do NOT throw to avoid breaking the core booking transaction flow
        console.error(`📧 Email service failed to send email to ${payload.to}:`, err);
      }
    } else {
      // Simulated logging output
      console.log('\n' + '='.repeat(50));
      console.log(`📧 SIMULATED EMAIL (EMAIL_ENABLED=false)`);
      console.log(`To      : ${payload.to}`);
      console.log(`Subject : ${subject}`);
      console.log('-'.repeat(50));
      console.log(bodyText);
      console.log('='.repeat(50) + '\n');
    }
  },
};
