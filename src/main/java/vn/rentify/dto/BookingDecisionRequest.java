package vn.rentify.dto;

import jakarta.validation.constraints.NotNull;
import vn.rentify.entity.BookingStatus;

public record BookingDecisionRequest(@NotNull BookingStatus status) {
}
