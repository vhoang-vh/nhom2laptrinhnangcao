package vn.rentify.dto;

import jakarta.validation.constraints.NotNull;

public record LandlordApprovalRequest(@NotNull Boolean approved) {
}
