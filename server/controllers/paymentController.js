const generateTicketPDF = require('../utils/generateTicketPDF');
const sendTicketEmail = require('../utils/sendTicketEmail');
const User = require('../models/User');
const Showtime = require('../models/Showtime');
const sendCancellationEmail = require('../utils/sendCancellationEmail');
const Razorpay = require("razorpay");
const { StatusCodes } = require('http-status-codes');


// exports.confirmPayment = async (req, res) => {
//     try {
//         const { userId, showtimeId, seats } = req.body;

//         if (!userId || !showtimeId || !Array.isArray(seats)) {
//             return res.status(400).json({ message: 'Invalid input data for resend' });
//         }

//         const user = await User.findById(userId);
//         const showtime = await Showtime.findById(showtimeId)
//             .populate('movie')
//             .populate({ path: 'theater', populate: { path: 'cinema' } });

//         if (!user || !showtime) {
//             return res.status(404).json({ message: 'User or showtime not found for resend' });
//         }

//         const bookingId = `BOOK-${Date.now()}`;
//         const filePath = await generateTicketPDF({
//             user,
//             showtime,
//             seats,
//             bookingId,
//         });

//         await sendTicketEmail(user.email, filePath, bookingId,user.username);

//         res.status(200).json({ message: 'Ticket re-sent successfully!' });
//     } catch (err) {
//         console.error('Error in resendTicketEmail:', err);
//         res.status(500).json({ message: 'Failed to resend ticket email' });
//     }
// };


exports.confirmPayment = async (req, res) => {
    try {
        const { userId, showtimeId, seats, paymentId, orderId, status } = req.body;

        const user = await User.findById(userId);
        const showtime = await Showtime.findById(showtimeId)
            .populate('movie')
            .populate({ path: 'theater', populate: { path: 'cinema' } });
        if (!user || !showtime) {
            return res.status(404).json({ message: "User or Showtime not found" });
        }

        if (status === "failed") {
            // Payment failed - send cancellation email
            await sendCancellationEmail(user.email, showtime, seats);
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Payment failed. Cancellation email sent."
            });
        }

        // Payment succeeded - generate ticket and send
        const bookingId = `BOOK-${Date.now()}`;
        const ticketPath = await generateTicketPDF({
            user,
            showtime,
            seats,
            bookingId,
        });

        await sendTicketEmail(user.email, ticketPath, bookingId, user.username, showtime);

        // Save to user model
        await User.findByIdAndUpdate(userId, {
            $push: { tickets: { showtime: showtime._id, seats } },
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Payment confirmed. Ticket sent via email."
        });
    } catch (err) {
        console.error("Error in confirmPayment:", err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
};



exports.resendTicketEmail = async (req, res) => {
    try {
        const { userId, showtimeId, seats } = req.body;

        if (!userId || !showtimeId || !Array.isArray(seats)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid input data for resend' });
        }

        const user = await User.findById(userId);
        const showtime = await Showtime.findById(showtimeId)
            .populate('movie')
            .populate({ path: 'theater', populate: { path: 'cinema' } });

        if (!user || !showtime) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User or showtime not found for resend' });
        }

        const bookingId = `BOOK-${Date.now()}`;
        const filePath = await generateTicketPDF({
            user,
            showtime,
            seats,
            bookingId,
        });

        await sendTicketEmail(user.email, filePath, bookingId, user.username, showtime);

        res.status(StatusCodes.OK).json({ message: 'Ticket re-sent successfully!' });
    } catch (err) {
        console.error('Error in resendTicketEmail:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to resend ticket email' });
    }
};



exports.cancelTicket = async (req, res) => {
    try {
        const { userId, showtimeId, seats } = req.body;

        if (!userId || !showtimeId || !Array.isArray(seats)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid cancellation data' });
        }

        const showtime = await Showtime.findById(showtimeId);
        console.log(showtime);
        const user = await User.findById(userId);

        if (!showtime || !user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Showtime or User not found' });
        }

        // Remove seats from showtime
        showtime.seats = showtime.seats.filter(seat =>
            !seats.some(cancelled =>
                seat.row === cancelled.row && seat.number === cancelled.number && seat.user.toString() === userId
            )
        );
        await showtime.save();

        // Remove ticket from user
        user.tickets = user.tickets.filter(ticket =>
            !(ticket.showtime.toString() === showtimeId &&
                ticket.seats.some(seat =>
                    seats.some(cancelled =>
                        seat.row === cancelled.row && seat.number === cancelled.number
                    )
                ))
        );
        await user.save();

        res.status(StatusCodes.OK).json({ message: 'Ticket cancelled successfully' });

        // OPTIONAL: You can also send a cancellation email here
        await sendCancellationEmail(user.email, showtime, seats);

    } catch (err) {
        console.error('❌ Ticket cancellation failed:', err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error during cancellation' });
    }
};




//Replace with your Razorpay Key ID and Secret
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
});
exports.createOrder = async (req, res) => {
    try {
        const { amount, currency = "INR", receipt } = req.body;

        const order = await razorpay.orders.create({
            amount: amount * 100, // Amount in paisa
            currency,
            receipt,
        });

        res.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
};

