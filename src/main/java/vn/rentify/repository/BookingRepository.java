package vn.rentify.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.rentify.entity.Booking;
import vn.rentify.entity.BookingStatus;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
    List<Booking> findByRoomLandlordIdOrderByCreatedAtDesc(Long landlordId);
    boolean existsByRoomIdAndStatusIn(Long roomId, List<BookingStatus> statuses);
    boolean existsByRoomId(Long roomId);
    boolean existsByRoomIdAndTenantIdAndStatusIn(Long roomId, Long tenantId, List<BookingStatus> statuses);

    long countByStatus(BookingStatus status);
}
