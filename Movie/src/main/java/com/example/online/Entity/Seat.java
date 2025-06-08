package com.example.online.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String seatNumber;

    private Boolean isAvailable = true;

    @ManyToOne(optional = false)
    @JoinColumn(name = "theater_id")
    @JsonIgnoreProperties("seats")  // Prevent recursion
    private TheaterLocation theater;

    @ManyToOne(optional = false)
    @JoinColumn(name = "movie_id")
    @JsonIgnoreProperties("seats")  // Prevent recursion
    private Movie movie;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getSeatNumber() {
		return seatNumber;
	}

	public void setSeatNumber(String seatNumber) {
		this.seatNumber = seatNumber;
	}

	public Boolean getIsAvailable() {
		return isAvailable;
	}

	public void setIsAvailable(Boolean isAvailable) {
		this.isAvailable = isAvailable;
	}

	public TheaterLocation getTheater() {
		return theater;
	}

	public void setTheater(TheaterLocation theater) {
		this.theater = theater;
	}

	public Movie getMovie() {
		return movie;
	}

	public void setMovie(Movie movie) {
		this.movie = movie;
	}
    
    
    
    
}
