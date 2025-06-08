package com.example.online.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class TheaterNotFoundException extends RuntimeException {
    public TheaterNotFoundException(Long id) {
        super("❌ Theater not found with ID: " + id);
    }
}
