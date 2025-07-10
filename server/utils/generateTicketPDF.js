const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const axios = require('axios');

const generateTicketPDF = async ({ user, showtime, seats, bookingId }) => {
    try {
        const ticketsDir = path.join(__dirname, '../tickets');
        if (!fs.existsSync(ticketsDir)) {
            fs.mkdirSync(ticketsDir, { recursive: true });
        }

        const filePath = path.join(ticketsDir, `${bookingId}.pdf`);
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // ✅ Fix 1: Movie poster from showtime.movie.posterUrl
        try {
            doc.fontSize(20).text('Movie Ticket', { align: 'center' }).moveDown();
            const posterUrl = showtime.movie?.img;
            if (posterUrl) {
                const response = await axios.get(showtime.movie.img, { responseType: 'arraybuffer' });
                doc.image(Buffer.from(response.data), { fit: [200, 250], align: 'center' }).moveDown();
            } else {
                console.warn('Poster URL not found in showtime.movie.posterUrl');
            }
        } catch (err) {
            console.warn('Could not load poster image:', err.message);
        }

        // ✅ Fix 2: Validate seat format
        const formattedSeats = seats.map(seat => {
            if (typeof seat === 'string') {
                const match = seat.match(/([A-Za-z]+)(\d+)/);
                if (match) {
                    return { row: match[1], number: parseInt(match[2], 10) };
                }
                return { row: 'X', number: 0 };
            }
            return seat;
        });

        // Add ticket details
        doc.fontSize(14)
            .text(`Booking ID: ${bookingId}`)
            .text(`Name: ${user.username || user.email}`)
            .text(`Movie: ${showtime.movie?.name || 'Unknown Movie'}`)
            .text(`Theatre: ${showtime.theater?.cinema?.name || 'Unknown'} - Screen ${showtime.theater?.number || '?'}`)
            .text(`Date & Time: ${new Date(showtime.showtime).toLocaleString()}`)
            .text(`Seats: ${formattedSeats.map(seat => `${seat.row}${seat.number}`).join(', ')}`)
            .text(`Total Seats: ${formattedSeats.length}`)
            .moveDown();

        // Add QR Code
        const qrData = JSON.stringify({
            bookingId,
            seats: formattedSeats.map(seat => `${seat.row}${seat.number}`),
            showtimeId: showtime._id,
        });
        const qrImage = await QRCode.toDataURL(qrData);
        doc.image(qrImage, { fit: [120, 120], align: 'center' });

        doc.end();

        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });

        return filePath;
    } catch (err) {
        throw err;
    }
};

module.exports = generateTicketPDF;
