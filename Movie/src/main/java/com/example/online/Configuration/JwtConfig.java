package com.example.online.Configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {
    private String secret;
    private long accessTokenExpiration;
    private long refreshExpiration;
	public String getSecret() {
		return secret;
	}
	public void setSecret(String secret) {
		this.secret = secret;
	}
	public long getAccessTokenExpiration() {
		return accessTokenExpiration;
	}
	public void setAccessTokenExpiration(long accessTokenExpiration) {
		this.accessTokenExpiration = accessTokenExpiration;
	}
	public long getRefreshExpiration() {
		return refreshExpiration;
	}
	public void setRefreshExpiration(long refreshExpiration) {
		this.refreshExpiration = refreshExpiration;
	}

    // getters and setters
    
    
    
    
}
