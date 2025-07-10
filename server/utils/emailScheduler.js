const cron = require('node-cron');
const Showtime = require('../models/Showtime');
const User = require('../models/User');
const generateTicketPDF = require('./generateTicketPDF');
const sendTicketEmail = require('./sendTicketEmail');

// This will run every minute
cron.schedule('* * * * *', async () => {
    console.log("Task run");
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    try {
        const showtimes = await Showtime.find({ 
            showtime: {
                $gte: new Date(oneHourLater.getTime() - 60000), 
                $lt: oneHourLater
            },
            isRelease: true
        }).populate('movie')
            .populate({
                path: 'theater',
                populate: { path: 'cinema' }
            });

        for (const showtime of showtimes) {
            for (const seat of showtime.seats) {
                if (!seat.user) continue;

                const user = await User.findById(seat.user);

                if (!user || !user.email) continue;

                const bookingId = `BOOK-${Date.now()}`;
                const ticketPath = await generateTicketPDF({
                    user,
                    showtime: {
                        ...showtime.toObject(),
                        posterUrl: showtime.posterUrl
                    },
                    seats: showtime.seats.filter(s => s.user?.toString() === user._id.toString()),
                    bookingId,
                });

                await sendTicketEmail(user.email, ticketPath, bookingId);
                console.log(`✅ Ticket emailed to ${user.email} for showtime ${showtime._id}`);
            }
        }
    } catch (err) {
        console.error('❌ Cron job error:', err.message);
    }
});
