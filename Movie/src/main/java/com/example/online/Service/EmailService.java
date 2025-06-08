package com.example.online.Service;

import com.example.online.Entity.Booking;
import com.example.online.Entity.User;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamSource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final TicketPDFService ticketPDFService;
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public EmailService(JavaMailSender mailSender, TicketPDFService ticketPDFService) {
        this.mailSender = mailSender;
        this.ticketPDFService = ticketPDFService;
    }

    // 🔹 Send OTP Email (Async)
    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "Your OTP for Verification";
        String body = "Your OTP is: " + otp + "\nPlease use it within 5 minutes.";
        sendWithRetry(toEmail, subject, body);
    }

    // 🔹 Send Booking Confirmation with PDF
    @Async
    public void sendBookingConfirmationEmail(String to, Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject("🎟 Booking Confirmed!");

            String body = "Hi " + getUserName(booking) + ",\n\n" +
                    "Your booking for **" + booking.getMovie().getTitle() + "** is confirmed.\n" +
                    "🏛 Theater: " + booking.getShow().getTheater().getName() + "\n" +
                    "🪑 Seats: " + booking.getSeatNumbers() + "\n" +
                    "🕒 Time: " + booking.getShow().getShowTime() + "\n\n" +
                    "Thank you for booking with us!\n\nBookMyShow Clone";

            helper.setText(body, false); // Plain text

            // Generate PDF and attach
            byte[] pdf = ticketPDFService.generateTicketPDF(
                    "Booking ID: " + booking.getId(),
                    booking.getMovie().getTitle(),
                    booking.getShow().getTheater().getName(),
                    booking.getSeatNumbers(),
                    booking.getShow().getShowTime()
            );

            InputStreamSource attachment = new ByteArrayResource(pdf);
            helper.addAttachment("Ticket.pdf", attachment);

            mailSender.send(message);
            logger.info("✅ Confirmation email with PDF sent to: {}", to);

        } catch (Exception e) {
            logger.error("❌ Failed to send booking confirmation to {} | Error: {}", to, e.getMessage());
        }
    }

    // 🔹 Send Booking Cancellation Email
    @Async
    public void sendBookingCancellationEmail(String to, Booking booking) {
        String subject = "❌ Booking Cancelled";
        String body = "Hi " + getUserName(booking) + ",\n\n" +
                "Your booking for " + booking.getMovie().getTitle() + " has been cancelled.\n\n" +
                "Regards,\nBookMyShow Clone";

        sendWithRetry(to, subject, body);
    }

    // 🔁 Retry Logic for OTP / Cancellation Emails
    private void sendWithRetry(String to, String subject, String body) {
        int attempts = 3;

        while (attempts-- > 0) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);

                logger.info("✅ Email sent to: {}", to);
                return;
            } catch (Exception e) {
                logger.warn("❌ Failed to send email to {} | Attempts left: {} | Error: {}", to, attempts, e.getMessage());
                if (attempts == 0) {
                    logger.error("🚨 Giving up on email to {}", to);
                }
                try {
                    TimeUnit.SECONDS.sleep(1); // Minor delay before retry
                } catch (InterruptedException ignored) {
                }
            }
        }
    }

    private String getUserName(Booking booking) {
        User user = booking.getUser();
        return user != null ? user.getUsername() : "User";
    }
}
