package com.example.online.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.online.Entity.TheaterLocation;

public interface TheaterRepository extends JpaRepository<TheaterLocation, Long> {}