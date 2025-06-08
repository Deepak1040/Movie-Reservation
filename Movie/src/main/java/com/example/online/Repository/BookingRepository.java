package com.example.online.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.online.Entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserEmail(String email);
    List<Booking> findByShowIdAndSeatNumbers(Long showId, String seatNumbers);
    List<Booking> findByShowId(Long showId);


}
