package com.example.online.Service;

import com.example.online.Entity.User;
import com.example.online.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Autowired
    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String gmail) throws UsernameNotFoundException {
        User user = userRepository.findByGmail(gmail)
                .orElseThrow(() -> new UsernameNotFoundException("❌ User not found with gmail: " + gmail));

        String role = user.getRole(); // should be either "ADMIN" or "USER"
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())
        );

        return new org.springframework.security.core.userdetails.User(
                user.getGmail(),
                user.getPassword(),
                authorities
        );
    }
}
