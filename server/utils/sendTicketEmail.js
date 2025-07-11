const nodemailer = require('nodemailer');
const path = require('path');
const generateICSFile = require('./generateICS');

const sendTicketEmail = async (toEmail, filePath, bookingId, userName, showtime) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.email,
            pass: process.env.password,
        },
    });
    const icsPath = await generateICSFile({
        movieName: showtime.movie.name,
        startTime: new Date(showtime.showtime),
        endTime: new Date(new Date(showtime.showtime).getTime() + (showtime.movie.length || 120) * 60000),
        location: `${showtime.theater.cinema.name} - Screen ${showtime.theater.number}`,
        bookingId
    });

    const start = formatToGoogleCalendarDate(showtime.showtime);
    const end = formatToGoogleCalendarDate(
        new Date(new Date(showtime.showtime).getTime() + (showtime.movie.length || 120) * 60000)
    );
    const location = `${showtime.theater.cinema.name} - Screen ${showtime.theater.number}`;
    const movieTitle = encodeURIComponent(showtime.movie.name);

    const googleCalendarLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${movieTitle}&dates=${start}/${end}&location=${encodeURIComponent(location)}&details=Enjoy+your+movie+with+Cinema+Booking`;



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
                <p>
                ➕ <a href="${googleCalendarLink}" target="_blank" style="color: #1a73e8;">Add to Google Calendar</a>
                </p>
	
            </div>
        </div>
    `;

    function formatToGoogleCalendarDate(date) {
        return new Date(date).toISOString().replace(/[-:]|\.\d{3}/g, '').slice(0, -1); // yyyymmddTHHMMSSZ
    }

    // Define Google Calendar Link

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
                    path: filePath
                },
                {
                    filename: `Event-${bookingId}.ics`,
                    path: icsPath
                }
            ]
        });

        console.log('✅ Email sent successfully.');
    } catch (err) {
        console.error('❌ Email send failed:', err.message);
    }
};

module.exports = sendTicketEmail;
