package com.example.online.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AdminRequest {

    @Email
    @NotBlank
    private String gmail;

    @NotBlank
    private String password;

    // Getters and setters
    public String getGmail() {
        return gmail;
    }

    public void setGmail(String gmail) {
        this.gmail = gmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
