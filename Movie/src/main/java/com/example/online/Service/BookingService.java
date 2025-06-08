package com.example.online.Service;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.example.online.Entity.Booking;
import com.example.online.Repository.BookingRepository;

import jakarta.mail.internet.MimeMessage;

@Service
public class BookingService {

    private final BookingRepository bookingRepo;
    private final JavaMailSender mailSender;

    // ✅ Razorpay secret from application.properties (with fallback to prevent error)
    @Value("${razorpay.key_secret:defaultKeySecret}")
    private String razorpaySecret;

    public BookingService(BookingRepository bookingRepo, JavaMailSender mailSender) {
        this.bookingRepo = bookingRepo;
        this.mailSender = mailSender;
    }

    // ✅ Book seats after checking for duplicates
    public boolean bookSeats(Booking booking) {
        List<Booking> existing = bookingRepo.findByShowIdAndSeatNumbers(
            booking.getShow().getId(), booking.getSeatNumbers()
        );

        if (!existing.isEmpty()) {
            return false; // ❌ One or more seats already booked
        }

        booking.setBookingTime(LocalDateTime.now().toString());
        booking.setPaymentStatus("PAID");
        bookingRepo.save(booking);
        return true;
    }

    // ✅ Save booking before payment with "PENDING" status
    public void savePendingBooking(Booking booking) {
        booking.setPaymentStatus("PENDING");
        booking.setBookingTime(LocalDateTime.now().toString());
        bookingRepo.save(booking);
    }

    // ✅ Confirm booking as paid after Razorpay verification
    public void confirmBookingAsPaid(Long bookingId, String orderId) {
        Booking booking = bookingRepo.findById(bookingId).orElse(null);
        if (booking != null && !"PAID".equals(booking.getPaymentStatus())) {
            booking.setPaymentStatus("PAID");
            booking.setRazorpayOrderId(orderId);
            bookingRepo.save(booking);
        }
    }

    // ✅ Verify Razorpay payment signature (HMAC SHA256)
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            String actualSignature = hmacSha256(payload, razorpaySecret);
            return actualSignature.equals(signature);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private String hmacSha256(String data, String key) throws Exception {
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), "HmacSHA256");
        sha256_HMAC.init(secretKey);
        byte[] hash = sha256_HMAC.doFinal(data.getBytes());
        return new String(Base64.getEncoder().encode(hash));
    }

    // ✅ Cancel booking
    public Booking cancelBooking(Long id) {
        Booking booking = bookingRepo.findById(id).orElse(null);
        if (booking == null || "CANCELLED".equals(booking.getPaymentStatus())) {
            return null;
        }

        booking.setPaymentStatus("CANCELLED");
        bookingRepo.save(booking);
        return booking;
    }

    // ✅ Find booking by ID
    public Booking findById(Long id) {
        return bookingRepo.findById(id).orElse(null);
    }

    // ✅ Get all bookings
    public List<Booking> getAllBookings() {
        return bookingRepo.findAll();
    }

    // ✅ Optional: Email notification helper
    private void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);
            mailSender.send(msg);
        } catch (Exception e) {
            System.out.println("Email error: " + e.getMessage());
        }
    }
}
