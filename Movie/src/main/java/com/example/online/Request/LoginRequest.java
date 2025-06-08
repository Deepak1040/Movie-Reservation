package com.example.online.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class LoginRequest {

    // Can be either gmail or username
    @NotBlank(message = "Username or Gmail is required")
    private String login; // user can enter either username or gmail

    @NotBlank(message = "Password is required")
    private String password;

	public String getLogin() {
		return login;
	}

	public void setLogin(String login) {
		this.login = login;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}


    

}
