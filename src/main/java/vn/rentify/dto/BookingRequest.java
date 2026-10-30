package vn.rentify.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record BookingRequest(
        @NotNull Long roomId,
        @NotNull @FutureOrPresent LocalDate moveInDate,
        @Size(max = 1000) String message
) {
}
