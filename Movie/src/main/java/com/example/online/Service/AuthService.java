package com.example.online.Service;

import com.example.online.Component.JwtUtil;
import com.example.online.Entity.Admin;
import com.example.online.Entity.OTPVerification;
import com.example.online.Exception.*;
import com.example.online.Repository.AdminRepository;
import com.example.online.Repository.OTPRepository;
import com.example.online.Repository.UserRepository;
import com.example.online.Request.*;
import com.example.online.Response.AuthResponse;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class AuthService {

    private final OTPRepository otpRepository;
    private final UserRepository userRepo;
    private final AdminRepository adminRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public AuthService(
            OTPRepository otpRepository,
            UserRepository userRepo,
            AdminRepository adminRepo,
            PasswordEncoder encoder,
            JwtUtil jwtUtil,
            EmailService emailService
    ) {
        this.otpRepository = otpRepository;
        this.userRepo = userRepo;
        this.adminRepo = adminRepo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    public String signupUser(SignupRequest req) {
        if (userRepo.findByGmail(req.getGmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Gmail already registered.");
        }

        com.example.online.Entity.User user = new com.example.online.Entity.User();
        user.setUsername(req.getUsername());
        user.setGmail(req.getGmail());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setRole("ROLE_USER");
        userRepo.save(user);

        return "User registered!";
    }

    public String signupAdmin(AdminRequest req) {
        if (adminRepo.findByGmail(req.getGmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Gmail already registered.");
        }

        Admin admin = new Admin();
        admin.setGmail(req.getGmail());
        admin.setPassword(encoder.encode(req.getPassword()));
        admin.setRole("ROLE_ADMIN");
        adminRepo.save(admin);

        return "Admin registered!";
    }

    public AuthResponse loginUser(LoginRequest req) {
        com.example.online.Entity.User user = userRepo.findByGmail(req.getLogin())
            .or(() -> userRepo.findByUsername(req.getLogin()))
            .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Wrong password");
        }

        UserDetails userDetails = User.builder()
            .username(user.getGmail())
            .password(user.getPassword())
            .roles("USER") // only USER
            .build();

        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return new AuthResponse(accessToken, refreshToken);
    }

    public AuthResponse loginAdmin(AdminRequest req) {
        Admin admin = adminRepo.findByGmail(req.getGmail())
                .orElseThrow(() -> new AdminNotFoundException("Admin not found"));

        if (!encoder.matches(req.getPassword(), admin.getPassword())) {
            throw new InvalidCredentialsException("Wrong password");
        }

        UserDetails userDetails = User.builder()
                .username(admin.getGmail())
                .password(admin.getPassword())
                .roles("ADMIN") // only ADMIN
                .build();

        String accessToken = jwtUtil.generateAccessToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return new AuthResponse(accessToken, refreshToken);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new InvalidTokenException("Refresh token is missing.");
        }

        if (!jwtUtil.validateToken(refreshToken)) {
            throw new InvalidTokenException("Refresh token is invalid or expired.");
        }

        String username = jwtUtil.extractUsername(refreshToken);
        if (username == null) {
            throw new InvalidTokenException("Username could not be extracted from token.");
        }

        List<String> roles = jwtUtil.extractRoles(refreshToken);
        if (roles == null || roles.isEmpty()) {
            roles = List.of("USER");
        }

        UserDetails userDetails = User.builder()
                .username(username)
                .password("") // not needed
                .roles(roles.stream().map(r -> r.replace("ROLE_", "")).toArray(String[]::new))
                .build();

        String newAccessToken = jwtUtil.generateAccessToken(userDetails);
        String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);

        return new AuthResponse(newAccessToken, newRefreshToken);
    }

    public String sendOtp(String gmail) {
        userRepo.findByGmail(gmail).orElseThrow(() -> new UserNotFoundException("User not found"));

        OTPVerification existing = otpRepository.findByGmail(gmail);
        if (existing != null) otpRepository.delete(existing);

        String otp = String.format("%06d", new Random().nextInt(999999));
        OTPVerification otpEntity = new OTPVerification();
        otpEntity.setGmail(gmail);
        otpEntity.setOtp(otp);
        otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        otpRepository.save(otpEntity);

        emailService.sendOtpEmail(gmail, otp);
        return "OTP sent to your Gmail.";
    }

    public String verifyOtp(OtpRequest req) {
        OTPVerification otpData = otpRepository.findByGmail(req.getGmail());

        if (otpData == null || !otpData.getOtp().equals(req.getOtp())) {
            throw new InvalidOtpException("Invalid or missing OTP.");
        }

        if (otpData.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRepository.delete(otpData);
            throw new InvalidOtpException("OTP has expired.");
        }

        otpRepository.delete(otpData);
        return "OTP verified successfully.";
    }

    public String resetPassword(PasswordResetRequest req) {
        com.example.online.Entity.User user = userRepo.findByGmail(req.getGmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        OTPVerification otpData = otpRepository.findByGmail(req.getGmail());
        if (otpData != null) {
            throw new OtpNotVerifiedException("OTP not yet verified.");
        }

        user.setPassword(encoder.encode(req.getNewPassword()));
        userRepo.save(user);

        return "Password reset successfully.";
    }

    public boolean verifyOtpOnly(String email, String otp) {
        OTPVerification otpData = otpRepository.findByGmail(email);
        if (otpData == null || !otpData.getOtp().equals(otp)) return false;

        if (otpData.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpRepository.delete(otpData);
            return false;
        }

        otpRepository.delete(otpData);
        return true;
    }

    public String resetPasswordDirect(String email, String newPassword) {
        com.example.online.Entity.User user = userRepo.findByGmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setPassword(encoder.encode(newPassword));
        userRepo.save(user);
        return "Password reset successfully.";
    }
}
