package vn.rentify.dto;

import vn.rentify.entity.Booking;
import vn.rentify.entity.BookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record BookingResponse(Long id, Long roomId, String roomTitle, Long tenantId, String tenantName,
                              LocalDate moveInDate, String message, BookingStatus status,
                              LocalDateTime createdAt) {
    public static BookingResponse from(Booking booking) {
        return new BookingResponse(booking.getId(), booking.getRoom().getId(), booking.getRoom().getTitle(),
                booking.getTenant().getId(), booking.getTenant().getFullName(), booking.getMoveInDate(),
                booking.getMessage(), booking.getStatus(), booking.getCreatedAt());
    }
}
