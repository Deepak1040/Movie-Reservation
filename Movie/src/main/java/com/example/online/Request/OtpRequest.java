package com.example.online.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OtpRequest {

    @NotBlank(message = "Gmail is required")
    @Email(message = "Invalid email format")
    private String gmail;

    @NotBlank(message = "OTP is required")
    private String otp;

	public String getGmail() {
		return gmail;
	}

	public void setGmail(String gmail) {
		this.gmail = gmail;
	}

	public String getOtp() {
		return otp;
	}

	public void setOtp(String otp) {
		this.otp = otp;
	}
    
    
    
    
}
