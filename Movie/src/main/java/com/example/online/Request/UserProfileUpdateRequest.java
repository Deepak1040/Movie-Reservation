package com.example.online.Request;

import java.util.List;
import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    private String bio;
    private List<String> favoriteMovies;

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public List<String> getFavoriteMovies() {
        return favoriteMovies;
    }

    public void setFavoriteMovies(List<String> favoriteMovies) {
        this.favoriteMovies = favoriteMovies;
    }
}
