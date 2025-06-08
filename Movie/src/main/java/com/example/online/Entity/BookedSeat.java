package com.example.online.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table( // ✅ Correct placement
    uniqueConstraints = {@UniqueConstraint(columnNames = {"show_id", "seatNumber"})}
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookedSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String seatNumber;

    @ManyToOne
    @JoinColumn(name = "show_id")
    private Show show;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

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

	public Show getShow() {
		return show;
	}

	public void setShow(Show show) {
		this.show = show;
	}

	public Booking getBooking() {
		return booking;
	}

	public void setBooking(Booking booking) {
		this.booking = booking;
	}
    
    
}
