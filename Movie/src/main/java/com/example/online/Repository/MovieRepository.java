package com.example.online.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.online.Entity.Movie;

public interface MovieRepository extends JpaRepository<Movie, Long> {
	
	
	
}
