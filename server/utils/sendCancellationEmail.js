const nodemailer = require('nodemailer');
const Showtime = require('../models/Showtime');

const sendCancellationEmail = async (email, showtime, seats) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.email,
            pass: process.env.password
        }
    });

    const seatList = seats.map(s => `${s.row}${s.number}`).join(', ');
 const show = await Showtime.findById(showtime._id)
    .populate('movie') // 👈 make sure movie is fully loaded
    .populate({
        path: 'theater',
        populate: { path: 'cinema' }
    });

    const htmlContent = `
        <h2>🎟️ Ticket Cancellation Confirmation</h2>
        <p>Your ticket has been cancelled.</p>
        <p><strong>Showtime:</strong> ${new Date(showtime.showtime).toLocaleString()}</p>
        <p><strong>Seats:</strong> ${seatList}</p>
        <p>We're sorry to see you go. Hope to see you again soon!</p>
    `;

    await transporter.sendMail({
        from: '"Cinema Booking" <your-email@gmail.com>',
        to: email,
        subject: '🎟️ Ticket Cancellation Confirmation',
        html: htmlContent
    });
};

module.exports = sendCancellationEmail;

