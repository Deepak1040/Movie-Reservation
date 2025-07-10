const nodemailer = require('nodemailer');
const path = require('path');

const sendTicketEmail = async (toEmail, filePath, bookingId, userName = 'Guest') => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.email,
            pass: process.env.password, 
        },
    });

    const htmlBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px;">
                <h2 style="color: #1a73e8;">🎬 Cinema Booking Confirmation</h2>
                <p>Hi <strong>${userName}</strong>,</p>
                <p>Thank you for booking your movie ticket with us! 🎉</p>
                <p>Your booking ID is <strong>${bookingId}</strong>.</p>
                
                <p>Please find your ticket attached as a PDF. Show this at the cinema gate to enter.</p>

                <hr style="margin: 20px 0;">
                <p style="font-size: 0.9rem; color: #666;">Need help? Contact us anytime at support@cinemabooking.com</p>
                <p style="font-size: 0.9rem; color: #999;">© ${new Date().getFullYear()} Cinema Booking Pvt. Ltd.</p>
            </div>
        </div>
    `;

    try {
        console.log('📨 Sending email to:', toEmail);
        console.log('📎 Attaching file:', filePath);

        await transporter.sendMail({
            from: '"Cinema Booking" <deepakappu961@gmail.com>',
            to: toEmail,
            subject: `🎫 Your Movie Ticket [${bookingId}]`,
            text: `Thanks for your booking! Booking ID: ${bookingId}`,
            html: htmlBody,
            attachments: [
                {
                    filename: `Ticket-${bookingId}.pdf`,
                    path: filePath,
                },
            ],
        });

        console.log('✅ Email sent successfully.');
    } catch (err) {
        console.error('❌ Email send failed:', err.message);
    }
};

module.exports = sendTicketEmail;
