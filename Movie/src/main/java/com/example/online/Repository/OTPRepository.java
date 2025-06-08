package com.example.online.Repository;

import com.example.online.Entity.OTPVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OTPRepository extends JpaRepository<OTPVerification, Long> {

	
	  OTPVerification findByGmail(String gmail);
    // 🔹 Find latest OTP entry for a given email (gmail)
    Optional<OTPVerification> findTopByGmailOrderByCreatedAtDesc(String gmail);

    // 🔹 Optional: Clear OTP entries for a user
    void deleteByGmail(String gmail);
}
