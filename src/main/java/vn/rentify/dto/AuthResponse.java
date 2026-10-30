package vn.rentify.dto;

public record AuthResponse(String tokenType, String accessToken, UserResponse user) {
    public AuthResponse(UserResponse user, String accessToken) {
        this("Bearer", accessToken, user);
    }
}
