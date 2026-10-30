package vn.rentify.dto;

import vn.rentify.entity.Room;
import vn.rentify.entity.RoomStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RoomResponse(Long id, Long landlordId, String landlordName, String title, String address,
                           String area, BigDecimal monthlyRent, BigDecimal areaSquareMeters,
                           String description, RoomStatus status, LocalDateTime createdAt) {
    public static RoomResponse from(Room room) {
        return new RoomResponse(room.getId(), room.getLandlord().getId(), room.getLandlord().getFullName(),
                room.getTitle(), room.getAddress(), room.getArea(), room.getMonthlyRent(),
                room.getAreaSquareMeters(), room.getDescription(), room.getStatus(), room.getCreatedAt());
    }
}
