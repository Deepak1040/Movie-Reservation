package com.example.online.Service;

import com.example.online.Entity.CastMember;
import com.example.online.Entity.Movie;
import com.example.online.Entity.TheaterLocation;
import com.example.online.Repository.MovieRepository;
import com.example.online.Repository.TheaterRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovieService {

    private final MovieRepository movieRepo;
    private final TheaterRepository theaterRepo;

    @Autowired
    public MovieService(MovieRepository movieRepo, TheaterRepository theaterRepo) {
        this.movieRepo = movieRepo;
        this.theaterRepo = theaterRepo;
    }

    // ✅ Get all movies
    public List<Movie> getAllMovies() {
        return movieRepo.findAll();
    }

    // ✅ Create a new movie with cast
    @Transactional
    public Movie createMovie(Movie movie) {
        // Validate and attach theater
        if (movie.getTheater() != null && movie.getTheater().getId() != null) {
            TheaterLocation theater = theaterRepo.findById(movie.getTheater().getId())
                    .orElseThrow(() -> new RuntimeException("❌ Theater not found with ID: " + movie.getTheater().getId()));
            movie.setTheater(theater);
        } else {
            movie.setTheater(null);
        }

        // Link cast members to movie
        if (movie.getCastMembers() != null) {
            for (CastMember cm : movie.getCastMembers()) {
                cm.setMovie(movie); // set back-reference
            }
        }

        return movieRepo.save(movie);
    }

    // ✅ Update existing movie
    @Transactional
    public Movie updateMovie(Long id, Movie details) {
        return movieRepo.findById(id).map(movie -> {
            movie.setName(details.getName());
            movie.setTitle(details.getTitle());
            movie.setDescription(details.getDescription());
            movie.setGenre(details.getGenre());
            movie.setLanguage(details.getLanguage());
            movie.setRating(details.getRating());
            movie.setTrailerUrl(details.getTrailerUrl());
            movie.setTiming(details.getTiming());
            movie.setPosterUrl(details.getPosterUrl());
            movie.setComingSoon(details.isComingSoon());

            // Set theater if provided
            if (details.getTheater() != null && details.getTheater().getId() != null) {
                TheaterLocation theater = theaterRepo.findById(details.getTheater().getId())
                        .orElseThrow(() -> new RuntimeException("❌ Theater not found with ID: " + details.getTheater().getId()));
                movie.setTheater(theater);
            } else {
                movie.setTheater(null);
            }

            // Update cast members
            movie.getCastMembers().clear(); // clear old ones
            if (details.getCastMembers() != null) {
                for (CastMember cm : details.getCastMembers()) {
                    cm.setMovie(movie); // link to parent
                    movie.getCastMembers().add(cm);
                }
            }

            return movieRepo.save(movie);
        }).orElseThrow(() -> new RuntimeException("❌ Movie not found with ID: " + id));
    }

    // ✅ Delete movie
    public void deleteMovie(Long id) {
        if (!movieRepo.existsById(id)) {
            throw new RuntimeException("❌ Movie not found with ID: " + id);
        }
        movieRepo.deleteById(id);
    }

    // ✅ Get movie by ID
    public Movie getMovieById(Long id) {
        return movieRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("❌ Movie not found with ID: " + id));
    }
}
