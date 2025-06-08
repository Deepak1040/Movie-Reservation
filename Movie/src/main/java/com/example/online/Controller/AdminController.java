package com.example.online.Controller;

import com.example.online.Entity.User;
import com.example.online.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    // ✅ Admin: Update user role
    @PutMapping("/users/{id}/role")
    public ResponseEntity<String> updateUserRole(@PathVariable Long id, @RequestParam String role) {
        Optional<User> optionalUser = userService.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found!");
        }

        String normalizedRole = role.trim().toUpperCase();
        if (!normalizedRole.equals("ADMIN") && !normalizedRole.equals("USER")) {
            return ResponseEntity.badRequest().body("Invalid role! Allowed values: ADMIN or USER.");
        }

        User user = optionalUser.get();
        user.setRole("ROLE_" + normalizedRole);
        userService.save(user);

        return ResponseEntity.ok("User role updated to " + normalizedRole);
    }
}
