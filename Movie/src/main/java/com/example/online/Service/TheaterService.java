package com.example.online.Service;

import com.example.online.Entity.Seat;
import com.example.online.Entity.TheaterLocation;
import com.example.online.Exception.TheaterNotFoundException;
import com.example.online.Repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TheaterService {

    private final TheaterRepository theaterRepository;

    @Autowired
    public TheaterService(TheaterRepository theaterRepository) {
        this.theaterRepository = theaterRepository;
    }

    // ✅ Get all theaters
    public List<TheaterLocation> getAll() {
        return theaterRepository.findAll();
    }

    // ✅ Save a new theater
    public TheaterLocation save(TheaterLocation theater) {
        return theaterRepository.save(theater);
    }

    // ✅ Update an existing theater safely
    @Transactional
    public TheaterLocation update(Long id, TheaterLocation updated) {
        TheaterLocation existing = theaterRepository.findById(id)
                .orElseThrow(() -> new TheaterNotFoundException(id));

        // Update only basic fields — not seats (to avoid orphan deletion errors)
        existing.setName(updated.getName());
        existing.setLocation(updated.getLocation());
        existing.setScreenNumber(updated.getScreenNumber());

        // ❌ Don't directly overwrite seats (causes issues with orphanRemoval)
        // ✅ Optional: Handle seats properly if needed, else ignore

        return existing; // auto saved due to @Transactional
    }

    // ✅ Delete a theater by ID
    public void delete(Long id) {
        if (!theaterRepository.existsById(id)) {
            throw new TheaterNotFoundException(id);
        }
        theaterRepository.deleteById(id);
    }
}
