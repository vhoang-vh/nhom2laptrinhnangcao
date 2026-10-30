package vn.rentify.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InvoiceRequest(
        @NotNull Long roomId,
        @NotNull Long tenantId,
        @NotNull LocalDate billingMonth,
        @NotNull @DecimalMin("0.00") BigDecimal electricityAmount,
        @NotNull @DecimalMin("0.00") BigDecimal waterAmount,
        @NotNull @DecimalMin("0.00") BigDecimal serviceAmount
) {
}
