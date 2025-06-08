package com.example.online.Service;

import com.example.online.Entity.Favorite;
import com.example.online.Entity.User;
import com.example.online.Repository.FavoriteRepository;
import com.example.online.Repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Register user
    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("ROLE_USER");
        user.setVerified(false);
        return userRepository.save(user);
    }

    // Get user by gmail
    public Optional<User> findByGmail(String gmail) {
        return userRepository.findByGmail(gmail);
    }

    // Get user by id
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    // Save user
    public User save(User user) {
        return userRepository.save(user);
    }

    // Update bio
    public User updateBio(String gmail, String bio) {
        User user = userRepository.findByGmail(gmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBio(bio);
        return userRepository.save(user);
    }

    // Add favorite
    public Favorite addFavoriteMovie(String gmail, Favorite favorite) {
        User user = userRepository.findByGmail(gmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        favorite.setUser(user);
        return favoriteRepository.save(favorite);
    }

    // Get favorites
    public List<Favorite> getFavorites(String gmail) {
        User user = userRepository.findByGmail(gmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getFavorites();
    }

    // Change password
    public void updatePassword(String gmail, String newPassword) {
        User user = userRepository.findByGmail(gmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // Mark verified after OTP
    public void markVerified(String gmail) {
        User user = userRepository.findByGmail(gmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerified(true);
        user.setOtp(null);
        userRepository.save(user);
    }

    // Save OTP for verification
    public void saveOtp(String gmail, String otp) {
        User user = userRepository.findByGmail(gmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setOtp(otp);
        userRepository.save(user);
    }
}
