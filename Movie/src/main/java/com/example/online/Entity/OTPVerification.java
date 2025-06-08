package com.example.online.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class OTPVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String gmail;
    private String otp;

    private LocalDateTime createdAt;    // Time of OTP creation
    private LocalDateTime expiryTime;   // When the OTP expires

    public OTPVerification() {}

    public OTPVerification(String email, String otp, int expiryMinutes) {
        this.gmail = email;
        this.otp = otp;
        this.createdAt = LocalDateTime.now();
        this.expiryTime = this.createdAt.plusMinutes(expiryMinutes); // Expiry logic
    }

    public Long getId() {
        return id;
    }

    public String getGmail() {
        return gmail;
    }

    public void setGmail(String email) {
        this.gmail = email;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }

    public void setExpiryTime(LocalDateTime expiryTime) {
        this.expiryTime = expiryTime;
    }

    public boolean isExpired() {
        return expiryTime.isBefore(LocalDateTime.now());
    }
}
