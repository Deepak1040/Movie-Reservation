package com.example.online.Dto;

import java.util.List;

public class MovieDto {

    private Long id;
    private String name;
    private String title;
    private String description;

    private String genre;
    private String language;
    private double rating;

    private String trailerUrl;
    private String timing;
    private String posterUrl;
    private Boolean comingSoon;
    private Long theaterId;

    private List<CastMemberDto> castMembers; // ✅ Add this field

    // Getters and Setters

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public String getGenre() {
        return genre;
    }
    public void setGenre(String genre) {
        this.genre = genre;
    }

    public String getLanguage() {
        return language;
    }
    public void setLanguage(String language) {
        this.language = language;
    }

    public double getRating() {
        return rating;
    }
    public void setRating(double rating) {
        this.rating = rating;
    }

    public String getTrailerUrl() {
        return trailerUrl;
    }
    public void setTrailerUrl(String trailerUrl) {
        this.trailerUrl = trailerUrl;
    }

    public String getTiming() {
        return timing;
    }
    public void setTiming(String timing) {
        this.timing = timing;
    }

    public String getPosterUrl() {
        return posterUrl;
    }
    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public Boolean getComingSoon() {
        return comingSoon;
    }
    public void setComingSoon(Boolean comingSoon) {
        this.comingSoon = comingSoon;
    }

    public Long getTheaterId() {
        return theaterId;
    }
    public void setTheaterId(Long theaterId) {
        this.theaterId = theaterId;
    }

    public List<CastMemberDto> getCastMembers() {
        return castMembers;
    }
    public void setCastMembers(List<CastMemberDto> castMembers) {
        this.castMembers = castMembers;
    }
}
