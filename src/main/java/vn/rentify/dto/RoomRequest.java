package vn.rentify.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import vn.rentify.entity.RoomStatus;

import java.math.BigDecimal;

public record RoomRequest(
        @NotBlank @Size(max = 160) String title,
        @NotBlank @Size(max = 500) String address,
        @NotBlank @Size(max = 100) String area,
        @NotNull @DecimalMin(value = "0.01") BigDecimal monthlyRent,
        @NotNull @DecimalMin(value = "0.01") BigDecimal areaSquareMeters,
        @Size(max = 2000) String description,
        RoomStatus status
) {
}
