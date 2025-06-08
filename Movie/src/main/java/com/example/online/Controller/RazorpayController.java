package com.example.online.Controller;

import com.example.online.Entity.Booking;
import com.example.online.Service.BookingService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
public class RazorpayController {

    @Value("${razorpay.key_id}")
    private String keyId;

    @Value("${razorpay.key_secret}")
    private String keySecret;

    private final BookingService bookingService;

    public RazorpayController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // ✅ Create Razorpay Order
    @PostMapping("/createOrder")
    public ResponseEntity<?> createOrder(@RequestBody Booking booking) {
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            String receiptId = UUID.randomUUID().toString();

            JSONObject options = new JSONObject();
            options.put("amount", booking.getAmount() * 100); // in paise
            options.put("currency", "INR");
            options.put("receipt", receiptId);

            Order order = client.orders.create(options);

            // Save pending booking with generated Razorpay order ID
            booking.setRazorpayOrderId(order.get("id"));
            bookingService.savePendingBooking(booking);

            return ResponseEntity.ok(order.toString());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error creating Razorpay order");
        }
    }

    // ✅ Verify Razorpay Payment Signature
    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(
            @RequestParam String razorpay_order_id,
            @RequestParam String razorpay_payment_id,
            @RequestParam String razorpay_signature) {

        boolean verified = bookingService.verifyPaymentSignature(
                razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (verified) {
            return ResponseEntity.ok("Payment successful");
        } else {
            return ResponseEntity.badRequest().body("Payment verification failed");
        }
    }
}
