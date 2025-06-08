package com.example.online.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.online.Entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByGmail(String gmail);
    Optional<User> findByUsername(String username);
}
