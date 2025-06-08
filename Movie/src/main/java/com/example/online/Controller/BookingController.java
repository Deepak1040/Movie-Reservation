package com.example.online.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.online.Entity.Booking;
import com.example.online.Service.BookingService;
import com.example.online.Service.EmailService;
import com.example.online.Service.TicketPDFService;

@RestController
@RequestMapping("/api/booking")
public class BookingController {

    private final BookingService bookingService;
    private final EmailService emailService;

    @Autowired
    private TicketPDFService ticketPDFService;

    public BookingController(BookingService bookingService, EmailService emailService) {
        this.bookingService = bookingService;
        this.emailService = emailService;
    }

    // ✅ Create a booking (with duplicate seat check + confirmation email)
    @PostMapping("/create")
    public ResponseEntity<String> createBooking(@RequestBody Booking booking) {
        boolean success = bookingService.bookSeats(booking);
        if (!success) {
            return ResponseEntity.badRequest().body("Some seats are already booked!");
        }

        if (booking.getUser() != null && booking.getUser().getGmail() != null) {
            emailService.sendBookingConfirmationEmail(booking.getUser().getGmail(), booking);
        }

        return ResponseEntity.ok("Booking successful and email sent!");
    }

    // ✅ Cancel a booking (with cancellation email)
    @DeleteMapping("/cancel/{id}")
    public ResponseEntity<String> cancelBooking(@PathVariable Long id) {
        Booking booking = bookingService.cancelBooking(id);
        if (booking == null) {
            return ResponseEntity.badRequest().body("Booking not found or already cancelled!");
        }

        if (booking.getUser() != null && booking.getUser().getGmail() != null) {
            emailService.sendBookingCancellationEmail(booking.getUser().getGmail(), booking);
        }

        return ResponseEntity.ok("Booking cancelled and email sent!");
    }

    // ✅ Get all bookings
    @GetMapping("/all")
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    // ✅ Razorpay payment success handler (verify signature + mark booking paid)
    @PostMapping("/payment/success")
    public ResponseEntity<String> handlePaymentSuccess(
            @RequestParam String orderId,
            @RequestParam String paymentId,
            @RequestParam String signature,
            @RequestParam Long bookingId
    ) {
        boolean isValid = bookingService.verifyPaymentSignature(orderId, paymentId, signature);
        if (!isValid) {
            return ResponseEntity.badRequest().body("Payment signature mismatch!");
        }

        bookingService.confirmBookingAsPaid(bookingId, orderId);
        return ResponseEntity.ok("Payment verified and booking marked as PAID.");
    }

    // ✅ QR Code PDF ticket download endpoint
    @GetMapping("/ticket/{id}")
    public ResponseEntity<byte[]> getTicket(@PathVariable Long id) throws Exception {
        Booking booking = bookingService.findById(id);
        if (booking == null) {
            return ResponseEntity.notFound().build();
        }

        byte[] pdf = ticketPDFService.generateTicketPDF(
            "Booking ID: " + booking.getId(),
            booking.getMovie().getTitle(),
            booking.getShow().getTheater().getName(),
            booking.getSeatNumbers(),
            booking.getShow().getShowTime()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ticket.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
