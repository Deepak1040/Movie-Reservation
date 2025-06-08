package com.example.online.Exception;

public class OtpNotVerifiedException extends RuntimeException {
    public OtpNotVerifiedException(String message) {
        super(message);
    }
}
