package com.example.online.Mapper;

import com.example.online.Dto.CastMemberDto;
import com.example.online.Dto.MovieDto;
import com.example.online.Entity.CastMember;
import com.example.online.Entity.Movie;
import com.example.online.Entity.TheaterLocation;

import java.util.List;
import java.util.stream.Collectors;

public class MovieMapper {

    // Convert Entity to DTO
    public static MovieDto toDto(Movie movie) {
        MovieDto dto = new MovieDto();
        dto.setId(movie.getId());
        dto.setTitle(movie.getTitle());
        dto.setName(movie.getName());
        dto.setLanguage(movie.getLanguage());
        dto.setDescription(movie.getDescription());

        // ✅ Convert CastMember list to DTO list
        if (movie.getCastMembers() != null) {
            List<CastMemberDto> castDtos = movie.getCastMembers().stream()
                    .map(c -> new CastMemberDto(c.getName(), c.getImageUrl()))
                    .collect(Collectors.toList());
            dto.setCastMembers(castDtos);
        }

        dto.setGenre(movie.getGenre());
        dto.setRating(movie.getRating());
        dto.setTrailerUrl(movie.getTrailerUrl());
        dto.setTiming(movie.getTiming());
        dto.setPosterUrl(movie.getPosterUrl());
        dto.setComingSoon(movie.isComingSoon());

        if (movie.getTheater() != null) {
            dto.setTheaterId(movie.getTheater().getId());
        }
        return dto;
    }

    // Convert DTO to Entity
    public static Movie toEntity(MovieDto dto, TheaterLocation theater) {
        Movie movie = new Movie();
        movie.setId(dto.getId());
        movie.setTitle(dto.getTitle());
        movie.setName(dto.getName());
        movie.setLanguage(dto.getLanguage());
        movie.setDescription(dto.getDescription());

        // ✅ Convert DTOs to CastMember entities and link them to movie
        if (dto.getCastMembers() != null) {
            List<CastMember> cast = dto.getCastMembers().stream()
                    .map(c -> {
                        CastMember castMember = new CastMember();
                        castMember.setName(c.getName());
                        castMember.setImageUrl(c.getImageUrl());
                        castMember.setMovie(movie); // Link back to movie
                        return castMember;
                    })
                    .collect(Collectors.toList());
            movie.setCastMembers(cast);
        }

        movie.setGenre(dto.getGenre());
        movie.setRating(dto.getRating());
        movie.setTrailerUrl(dto.getTrailerUrl());
        movie.setTiming(dto.getTiming());
        movie.setPosterUrl(dto.getPosterUrl());
        movie.setComingSoon(dto.getComingSoon() != null && dto.getComingSoon());
        movie.setTheater(theater);

        return movie;
    }
}
