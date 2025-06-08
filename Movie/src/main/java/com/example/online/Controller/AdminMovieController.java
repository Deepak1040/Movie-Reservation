package com.example.online.Controller;

import com.example.online.Dto.MovieDto;
import com.example.online.Entity.Movie;
import com.example.online.Entity.TheaterLocation;
import com.example.online.Mapper.MovieMapper;
import com.example.online.Repository.TheaterRepository;
import com.example.online.Service.MovieService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/movies")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AdminMovieController {

    @Autowired
    private MovieService movieService;

    @Autowired
    private TheaterRepository theaterRepo;

    // ✅ Create movie
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createMovie(@RequestBody MovieDto dto) {
        try {
            if (dto.getTheaterId() == null) {
                return ResponseEntity.badRequest().body("Theater ID is required.");
            }

            TheaterLocation theater = theaterRepo.findById(dto.getTheaterId())
                    .orElseThrow(() -> new RuntimeException("❌ Theater not found with ID: " + dto.getTheaterId()));

            Movie movie = MovieMapper.toEntity(dto, theater);
            Movie saved = movieService.createMovie(movie);
            return ResponseEntity.status(HttpStatus.CREATED).body(MovieMapper.toDto(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error creating movie: " + e.getMessage());
        }
    }

    // ✅ Update movie
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateMovie(@PathVariable Long id, @RequestBody MovieDto dto) {
        try {
            if (dto.getTheaterId() == null) {
                return ResponseEntity.badRequest().body("Theater ID is required.");
            }

            TheaterLocation theater = theaterRepo.findById(dto.getTheaterId())
                    .orElseThrow(() -> new RuntimeException("❌ Theater not found with ID: " + dto.getTheaterId()));

            Movie movie = MovieMapper.toEntity(dto, theater);
            Movie updated = movieService.updateMovie(id, movie);
            return ResponseEntity.ok(MovieMapper.toDto(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error updating movie: " + e.getMessage());
        }
    }

    // ✅ Delete movie
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMovie(@PathVariable Long id) {
        try {
            movieService.deleteMovie(id);
            return ResponseEntity.ok("✅ Movie deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ Error deleting movie: " + e.getMessage());
        }
    }
}
