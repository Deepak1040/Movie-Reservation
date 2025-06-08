package com.example.online.Controller;

import com.example.online.Entity.TheaterLocation;
import com.example.online.Service.TheaterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/theaters")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TheaterController {

    private final TheaterService theaterService;

    public TheaterController(TheaterService theaterService) {
        this.theaterService = theaterService;
    }

    // ✅ GET all theaters
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')") // changed from hasAuthority
    public ResponseEntity<List<TheaterLocation>> getAllTheaters() {
        List<TheaterLocation> theaters = theaterService.getAll();
        return ResponseEntity.ok(theaters);
    }

    // ✅ POST a new theater
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TheaterLocation> createTheater(@RequestBody TheaterLocation theater) {
        TheaterLocation saved = theaterService.save(theater);
        return ResponseEntity.ok(saved);
    }

    // ✅ PUT update a theater
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TheaterLocation> updateTheater(@PathVariable Long id,
                                                         @RequestBody TheaterLocation updated) {
        TheaterLocation result = theaterService.update(id, updated);
        return ResponseEntity.ok(result);
    }

    // ✅ DELETE a theater
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteTheater(@PathVariable Long id) {
        theaterService.delete(id);
        return ResponseEntity.ok("✅ Theater deleted successfully.");
    }
}
