package vn.rentify.dto;

import java.math.BigDecimal;

public record AdminStatsResponse(long totalUsers, long totalLandlords, long pendingLandlords,
                                long totalRooms, long availableRooms, long totalBookings,
                                long pendingBookings, BigDecimal paidInvoiceRevenue) {
}
