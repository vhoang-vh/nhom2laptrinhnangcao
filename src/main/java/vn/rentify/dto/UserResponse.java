package vn.rentify.dto;

import vn.rentify.entity.Role;
import vn.rentify.entity.User;

public record UserResponse(Long id, String fullName, String email, String phone, Role role, boolean approved) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(),
                user.getRole(), user.isApproved());
    }
}
