package com.example.online.Controller;

import com.example.online.Entity.User;
import com.example.online.Payload.OtpResetRequest;
import com.example.online.Repository.UserRepository;
import com.example.online.Request.*;
import com.example.online.Response.AuthResponse;
import com.example.online.Service.AuthService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // Update if frontend runs elsewhere
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @Autowired
    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    // ========== USER AUTH ==========

    @PostMapping("/signup-user")
    public ResponseEntity<String> signupUser(@Valid @RequestBody SignupRequest req) {
        try {
            String message = authService.signupUser(req);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login-user")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest req) {
        try {
            AuthResponse response = authService.loginUser(req);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // ========== ADMIN AUTH ==========

    @PostMapping("/signup-admin")
    public ResponseEntity<String> signupAdmin(@Valid @RequestBody AdminRequest req) {
        try {
            String message = authService.signupAdmin(req);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login-admin")
    public ResponseEntity<?> loginAdmin(@Valid @RequestBody AdminRequest req) {
        try {
            AuthResponse response = authService.loginAdmin(req);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // ========== OTP ==========

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestParam String gmail) {
        try {
            String message = authService.sendOtp(gmail);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@Valid @RequestBody OtpRequest req) {
        try {
            String message = authService.verifyOtp(req);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ========== PASSWORD RESET ==========

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody PasswordResetRequest req) {
        try {
            String message = authService.resetPassword(req);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify-otp-and-reset")
    public ResponseEntity<String> verifyOtpAndReset(@Valid @RequestBody OtpResetRequest req) {
        boolean valid = authService.verifyOtpOnly(req.getEmail(), req.getOtp());
        if (!valid) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP");
        }

        String result = authService.resetPasswordDirect(req.getEmail(), req.getNewPassword());
        return ResponseEntity.ok(result);
    }

    // ========== TOKEN REFRESH ==========

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody TokenRefreshRequest req) {
        try {
            AuthResponse refreshed = authService.refreshToken(req.getRefreshToken());
            return ResponseEntity.ok(refreshed);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // ========== PROFILE UPDATE ==========

    @PutMapping("/update-profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateProfile(@RequestBody UserProfileUpdateRequest request, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByGmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        user.setBio(request.getBio());
        user.setFavoriteMovies(request.getFavoriteMovies());
        userRepository.save(user);

        return ResponseEntity.ok("Profile updated successfully");
    }
}
