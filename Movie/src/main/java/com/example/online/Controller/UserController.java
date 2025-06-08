package com.example.online.Controller;

import com.example.online.Entity.Favorite;
import com.example.online.Entity.User;
import com.example.online.Service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // ✅ User: Update bio
    @PutMapping("/update-bio")
    public ResponseEntity<String> updateBio(@RequestParam String bio, Principal principal) {
        String gmail = principal.getName();
        userService.updateBio(gmail, bio);
        return ResponseEntity.ok("Bio updated successfully.");
    }

    // ✅ User: Add favorite movie
    @PostMapping("/favorites")
    public ResponseEntity<Favorite> addFavorite(@RequestBody Favorite favorite, Principal principal) {
        String gmail = principal.getName();
        Favorite saved = userService.addFavoriteMovie(gmail, favorite);
        return ResponseEntity.ok(saved);
    }

    // ✅ User: Get all favorite movies
    @GetMapping("/favorites")
    public ResponseEntity<List<Favorite>> getFavorites(Principal principal) {
        String gmail = principal.getName();
        List<Favorite> favorites = userService.getFavorites(gmail);
        return ResponseEntity.ok(favorites);
    }

    // ✅ User: Change password
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestParam String newPassword, Principal principal) {
        String gmail = principal.getName();
        userService.updatePassword(gmail, newPassword);
        return ResponseEntity.ok("Password updated successfully.");
    }

    // ✅ User: Get full profile (username, gmail, bio, bookings, favorites)
    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile(Principal principal) {
        String gmail = principal.getName();
        User user = userService.findByGmail(gmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }
}
