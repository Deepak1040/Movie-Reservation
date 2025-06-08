package com.example.online.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.online.Entity.Seat;

public interface SeatRepository extends JpaRepository<Seat, Long>{

}
