const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

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

        // Add movie poster
        try {
            const response = await axios.get(showtime.posterUrl, { responseType: 'arraybuffer' });
            doc.image(Buffer.from(response.data), { fit: [200, 250], align: 'center' }).moveDown();
        } catch (err) {
            console.warn('Could not load poster image:', err.message);
        }

        console.log(user);
        
        // Add ticket details
        doc.fontSize(20).text(' Movie Ticket', { align: 'center' }).moveDown();
        doc.fontSize(14)
            .text(`Booking ID: ${bookingId}`)
            .text(`Name: ${user.name}`)
            .text(`Movie: ${showtime.movie.name}`)
            .text(`Theatre: ${showtime.theater.cinema.name} - Screen ${showtime.theater.number}`)
            .text(`Date & Time: ${new Date(showtime.showtime).toLocaleString()}`)
            .text(`Seats: ${seats.map(seat => `${seat.row}${seat.number}`).join(', ')}`)
            .text(`Total Seats: ${seats.length}`)
            .moveDown();

        // Add QR Code
        const qrData = JSON.stringify({
            bookingId,
            seats: seats.map(seat => `${seat.row}${seat.number}`),
            showtimeId: showtime._id,
        });
        const qrImage = await QRCode.toDataURL(qrData);
        doc.image(qrImage, { fit: [120, 120], align: 'center' });

        doc.end();

        // Wait until file is fully written
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
