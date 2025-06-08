package com.example.online.Service;

import com.example.online.Entity.OTPVerification;
import com.example.online.Repository.OTPRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    private static final int EXPIRY_MINUTES = 5;

    @Autowired
    private OTPRepository otpRepository;

    // 🔹 Generate a new OTP and store in DB
    public String generateAndSaveOtp(String gmail) {
        // Delete any existing OTPs for this email (optional cleanup)
        otpRepository.deleteByGmail(gmail);

        String otp = String.valueOf(100000 + new Random().nextInt(900000)); // 6-digit OTP
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiryTime = now.plusMinutes(EXPIRY_MINUTES);

        OTPVerification otpRecord = new OTPVerification();
        otpRecord.setGmail(gmail);
        otpRecord.setOtp(otp);
        otpRecord.setCreatedAt(now);
        otpRecord.setExpiryTime(expiryTime);

        otpRepository.save(otpRecord);
        return otp;
    }

    // 🔹 Verify OTP and delete it if successful
    public boolean verifyOtp(String gmail, String userOtp) {
        Optional<OTPVerification> optionalOtp = otpRepository.findTopByGmailOrderByCreatedAtDesc(gmail);

        if (optionalOtp.isEmpty()) return false;

        OTPVerification otpRecord = optionalOtp.get();

        if (otpRecord.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRepository.delete(otpRecord); // Clean up expired OTP
            return false;
        }

        boolean isValid = otpRecord.getOtp().equals(userOtp);

        if (isValid) {
            otpRepository.delete(otpRecord); // OTP used once
        }

        return isValid;
    }

    // 🔹 Optional: Check if resend allowed (after expiry only)
    public boolean canResendOtp(String gmail) {
        Optional<OTPVerification> optionalOtp = otpRepository.findTopByGmailOrderByCreatedAtDesc(gmail);
        return optionalOtp.isEmpty() || optionalOtp.get().getExpiryTime().isBefore(LocalDateTime.now());
    }
}
