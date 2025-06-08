package com.example.online.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.online.Entity.Favorite;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {}
