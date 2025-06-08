const nodemailer = require('nodemailer');

const sendTicketEmail = async (toEmail, filePath, bookingId) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'deepakappu961@gmail.com',
            pass: 'kluj gwtk avka iewy', // App Password
        },
    });

    try {
        console.log('Sending email to:', toEmail);
        console.log('Attaching file:', filePath);

        await transporter.sendMail({
            from: '"Cinema Booking" <deepakappu961@gmail.com>',
            to: toEmail,
            subject: `🎫 Your Movie Ticket [${bookingId}]`,
            text: 'Thanks for your booking! Please find your ticket attached.',
            attachments: [
                {
                    filename: `Ticket-${bookingId}.pdf`,
                    path: filePath,
                },
            ],
        });

        console.log('Email sent successfully.');
    } catch (err) {
        console.error('❌ Email send failed:', err.message);
    }
};

module.exports = sendTicketEmail;
