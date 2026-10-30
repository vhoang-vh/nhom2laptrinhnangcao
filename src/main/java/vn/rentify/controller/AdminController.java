package vn.rentify.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import vn.rentify.dto.AdminStatsResponse;
import vn.rentify.dto.LandlordApprovalRequest;
import vn.rentify.dto.RoomResponse;
import vn.rentify.dto.UserResponse;
import vn.rentify.service.AdminService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminStatsResponse stats() {
        return adminService.stats();
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> users() {
        return adminService.users();
    }

    @GetMapping("/rooms")
    @PreAuthorize("hasRole('ADMIN')")
    public List<RoomResponse> rooms() {
        return adminService.rooms();
    }

    @GetMapping("/landlords/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> pendingLandlords() {
        return adminService.pendingLandlords();
    }

    @PatchMapping("/landlords/{id}/approval")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse decideLandlord(@PathVariable Long id,
                                       @Valid @RequestBody LandlordApprovalRequest request) {
        return adminService.decideLandlord(id, request.approved());
    }
}
