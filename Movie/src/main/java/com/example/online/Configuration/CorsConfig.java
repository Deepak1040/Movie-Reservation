package com.example.online.Configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Apply CORS to all API endpoints
                        .allowedOriginPatterns("http://localhost:5173") // ✅ Frontend origin (Vite default)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Supported HTTP methods
                        .allowedHeaders("*") // Allow all headers
                        .allowCredentials(true); // ✅ Allow sending cookies/Authorization headers
            }
        };
    }
}
