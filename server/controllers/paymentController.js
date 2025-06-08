const generateTicketPDF = require('../utils/generateTicketPDF');
const sendTicketEmail = require('../utils/sendTicketEmail');
const User = require('../models/User');
const Showtime = require('../models/Showtime');

exports.confirmPayment = async (req, res) => {
    try {
        const { userId, showtimeId, seats, paymentId } = req.body;

        const user = await User.findById(userId);
        const showtime = await Showtime.findById(showtimeId);

        const bookingId = `BOOK-${Date.now()}`;

        const filePath = await generateTicketPDF({
            user,
            showtime,
            seats,
            bookingId,
        });

        await sendTicketEmail(user.email, filePath, bookingId);

        res.status(200).json({ message: 'Ticket sent successfully!' });
    } catch (err) {
        console.error('Error in confirmPayment:', err);
        res.status(500).json({ message: 'Failed to confirm payment and send ticket' });
    }
};
