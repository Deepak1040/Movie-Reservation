const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
require('dotenv').config()

const auth = require('./routes/auth')
const cinema = require('./routes/cinema')
const theater = require('./routes/theater')
const movie = require('./routes/movie')
const showtime = require('./routes/showtime')
const User = require('./models/User');
const Showtime = require('./models/Showtime');

mongoose.set('strictQuery', false)
mongoose
    .connect(process.env.DATABASE, { autoIndex: true })
    .then(() => {
        console.log('mongoose connected!')
    })
    .catch((err) => console.log(err))

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: true, credentials: true }))
app.use(mongoSanitize())
app.use(helmet())
app.use(xss())

app.use('/auth', auth)
app.use('/cinema', cinema)
app.use('/theater', theater)
app.use('/movie', movie)
app.use('/showtime', showtime)
app.use(express.json());


app.use(cors({
    origin: 'http://localhost:5173', // or your frontend URL
    credentials: true
}));

const Razorpay = require("razorpay");
const bodyParser = require("body-parser");
// Already required express and cors above, and app is already declared
app.use(bodyParser.json());

// Replace with your Razorpay Key ID and Secret
const razorpay = new Razorpay({
    key_id: "rzp_test_sycH67uhy6UEpf",
    key_secret: "18gcLyXJdpZ2ZoqeBFj3dyBN",
});

app.post("/create-order", async (req, res) => {
    const { amount, currency = "INR", receipt } = req.body;

    try {
        const order = await razorpay.orders.create({
            amount: amount * 100, // amount in paisa
            currency,
            receipt,
        });

        res.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// app.listen(3000, () => {
//     console.log("Server running on http://localhost:3000");
// });
//Remove this duplicate listen; the app is already listening on the port defined above

const fs = require('fs');
const path = require('path');

// Ensure the tickets folder exists
const ticketDir = path.join(__dirname, 'tickets');
if (!fs.existsSync(ticketDir)) {
    fs.mkdirSync(ticketDir);
}


const generateTicketPDF = require('./utils/generateTicketPDF');
const sendTicketEmail = require('./utils/sendTicketEmail');

app.post('/ticket/resend', async (req, res) => {
    try {
        const { userId, showtimeId, seats } = req.body;
        console.log('📩 Resend Request Body:', req.body);

        // Validate request data
        if (!userId || !showtimeId || !seats || !Array.isArray(seats)) {
            return res.status(400).json({ error: 'Missing or invalid fields in request body' });
        }

        // Fetch user
        const user = await User.findById(userId);
        if (!user) {
            console.error('❌ User not found for ID:', userId);
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch showtime with nested data populated
        const showtime = await Showtime.findById(showtimeId)
            .populate('movie')
            .populate({
                path: 'theater',
                populate: { path: 'cinema' }
            });

        if (!showtime) {
            console.error('❌ Showtime not found for ID:', showtimeId);
            return res.status(404).json({ error: 'Showtime not found' });
        }

        const bookingId = `BOOK-${Date.now()}`;
        const ticketPath = await generateTicketPDF({
            user,
            showtime: {
                ...showtime.toObject(),
                posterUrl: showtime.posterUrl,
            },
            seats,
            bookingId,
        });

        await sendTicketEmail(user.email, ticketPath, bookingId);

        res.json({ success: true, message: 'Ticket re-sent via email.' });
    } catch (err) {
        console.error('❌ Resend failed:', err);
        res.status(500).json({ error: 'Failed to resend ticket.', details: err.message });
    }
});






const paymentRoutes = require('./routes/payment');
app.use('/payment', paymentRoutes);



const port = process.env.PORT || 8080

app.listen(port, () => console.log(`start server in port ${port}`))

