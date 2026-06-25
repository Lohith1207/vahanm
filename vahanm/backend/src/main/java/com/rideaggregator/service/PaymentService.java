package com.rideaggregator.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.rideaggregator.dto.payment.PaymentOrderRequest;
import com.rideaggregator.dto.payment.PaymentVerifyRequest;
import com.rideaggregator.model.Payment;
import com.rideaggregator.model.User;
import com.rideaggregator.repository.PaymentRepository;
import com.rideaggregator.repository.UserRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    @Value("${app.razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret}")
    private String razorpayKeySecret;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> createOrder(String userId, PaymentOrderRequest request) throws RazorpayException {
        RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        // Razorpay accepts amount in paise (multiply by 100)
        double amountInRupees = request.getAmount();
        int amountInPaise = (int) (amountInRupees * 100);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

        Order razorpayOrder = razorpayClient.orders.create(orderRequest);

        // Save initial payment record
        Payment payment = Payment.builder()
                .userId(userId)
                .amount(amountInRupees)
                .currency("INR")
                .razorpayOrderId(razorpayOrder.get("id"))
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", razorpayOrder.get("id"));
        response.put("amount", amountInRupees);
        response.put("keyId", razorpayKeyId); // Send key to frontend for initialization
        return response;
    }

    public Map<String, Object> verifyPayment(String userId, PaymentVerifyRequest request) throws Exception {
        // Verify signature
        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", request.getRazorpayOrderId());
        options.put("razorpay_payment_id", request.getRazorpayPaymentId());
        options.put("razorpay_signature", request.getRazorpaySignature());

        boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

        if (!isValid) {
            Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId());
            if (payment != null) {
                payment.setStatus("FAILED");
                payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
                paymentRepository.save(payment);
            }
            throw new Exception("Payment signature verification failed");
        }

        // Find payment
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId());
        if (payment == null) {
            throw new Exception("Payment order not found in database");
        }

        if ("SUCCESS".equals(payment.getStatus())) {
            throw new Exception("Payment is already processed");
        }

        // Update payment status
        payment.setStatus("SUCCESS");
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        paymentRepository.save(payment);

        // Update user wallet balance
        User user = userRepository.findById(userId).orElseThrow(() -> new Exception("User not found"));
        user.setWalletBalance(user.getWalletBalance() + payment.getAmount());
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("walletBalance", user.getWalletBalance());
        return response;
    }

    public List<Payment> getPaymentHistory(String userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
