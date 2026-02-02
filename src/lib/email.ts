
import { Resend } from 'resend';

interface EmailParams {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailParams) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.warn('RESEND_API_KEY is not set. Simulating email send...');
        console.log('--- EMAIL SIMULATION START ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('Body:', html);
        console.log('--- EMAIL SIMULATION END ---');
        return { success: true, simulated: true };
    }

    try {
        const resend = new Resend(apiKey);
        const data = await resend.emails.send({
            from: 'Weave Journeys <onboarding@resend.dev>', // Use verified domain in prod
            to,
            subject,
            html,
        });
        return { success: true, data };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error };
    }
}

export function generateBookingEmailHtml(
    type: 'user' | 'guide',
    booking: any,
    videoLink: string
) {
    // Basic HTML template
    const isUser = type === 'user';
    const title = isUser ? 'Your Booking Confirmed!' : 'New Booking Request!';

    return `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2563eb;">${title}</h2>
      <p>Hello,</p>
      <p>${isUser ? `You have successfully booked a session with ${booking.guide.name}.` : `You have a new booking from ${booking.fullName}.`}</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Details</h3>
        <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${booking.timeSlot}</p>
        <p><strong>${isUser ? 'Guide' : 'Traveler'}:</strong> ${isUser ? booking.guide.name : booking.fullName}</p>
        <p><strong>Video Call Link:</strong> <a href="${videoLink}">${videoLink}</a></p>
      </div>

      <p>Please join the video call at the scheduled time.</p>
      <p>Best regards,<br/>Weave Journeys Team</p>
    </div>
  `;
}
