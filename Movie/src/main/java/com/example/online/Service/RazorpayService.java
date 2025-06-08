package com.example.online.Service;

import java.util.UUID;

import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

import jakarta.annotation.PostConstruct;

@Service
public class RazorpayService {

    private RazorpayClient client;

    @PostConstruct
    public void init() throws RazorpayException {
        client = new RazorpayClient("rzp_test_sycH67uhy6UEpf", "18gcLyXJdpZ2ZoqeBFj3dyB"); // Use test keys
    }

    public String createOrder(Double amount) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount * 100); // paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + UUID.randomUUID());
        Order order = client.orders.create(orderRequest);
        return order.toString();
    }
}
