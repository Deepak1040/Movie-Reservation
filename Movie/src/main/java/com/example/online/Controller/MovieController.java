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

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class MovieController {

    @Autowired
    private MovieService movieService;

    @GetMapping
    public ResponseEntity<List<MovieDto>> getAllMovies() {
        try {
            List<Movie> movies = movieService.getAllMovies();
            List<MovieDto> movieDtos = movies.stream()
                    .map(MovieMapper::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(movieDtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieById(@PathVariable Long id) {
        try {
            Movie movie = movieService.getMovieById(id);
            return ResponseEntity.ok(MovieMapper.toDto(movie));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Movie not found.");
        }
    }
}
