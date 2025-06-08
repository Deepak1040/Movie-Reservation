package com.example.online.Dto;

public class CastMemberDto {
    private String name;
    private String imageUrl;

    public CastMemberDto() {}

    public CastMemberDto(String name, String imageUrl) {
        this.name = name;
        this.imageUrl = imageUrl;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
