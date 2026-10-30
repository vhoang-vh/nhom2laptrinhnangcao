package vn.rentify.dto;

import vn.rentify.entity.Invoice;
import vn.rentify.entity.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InvoiceResponse(Long id, Long roomId, String roomTitle, Long tenantId, String tenantName,
                              LocalDate billingMonth, BigDecimal rentAmount, BigDecimal electricityAmount,
                              BigDecimal waterAmount, BigDecimal serviceAmount, BigDecimal totalAmount,
                              InvoiceStatus status) {
    public static InvoiceResponse from(Invoice invoice) {
        return new InvoiceResponse(invoice.getId(), invoice.getRoom().getId(), invoice.getRoom().getTitle(),
                invoice.getTenant().getId(), invoice.getTenant().getFullName(), invoice.getBillingMonth(),
                invoice.getRentAmount(), invoice.getElectricityAmount(), invoice.getWaterAmount(),
                invoice.getServiceAmount(), invoice.getTotalAmount(), invoice.getStatus());
    }
}
