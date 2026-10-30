package vn.rentify.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.rentify.dto.BookingRequest;
import vn.rentify.dto.BookingResponse;
import vn.rentify.dto.BookingDecisionRequest;
import vn.rentify.entity.Booking;
import vn.rentify.entity.BookingStatus;
import vn.rentify.entity.Room;
import vn.rentify.entity.RoomStatus;
import vn.rentify.entity.User;
import vn.rentify.exception.BadRequestException;
import vn.rentify.exception.ConflictException;
import vn.rentify.exception.ForbiddenException;
import vn.rentify.exception.ResourceNotFoundException;
import vn.rentify.repository.BookingRepository;
import vn.rentify.repository.RoomRepository;

import java.util.List;

@Service
public class BookingService {
    private static final List<BookingStatus> ACTIVE_STATUSES = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final CurrentUserService currentUserService;

    public BookingService(BookingRepository bookingRepository, RoomRepository roomRepository,
                         CurrentUserService currentUserService) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public BookingResponse create(BookingRequest request) {
        User tenant = currentUserService.getUser();
        Room room = roomRepository.findByIdForUpdate(request.roomId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng."));
        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new ConflictException("Phòng hiện không còn khả dụng.");
        }
        if (bookingRepository.existsByRoomIdAndTenantIdAndStatusIn(room.getId(), tenant.getId(), ACTIVE_STATUSES)) {
            throw new ConflictException("Bạn đã có yêu cầu đang xử lý hoặc đặt phòng tại phòng này.");
        }
        if (bookingRepository.existsByRoomIdAndStatusIn(room.getId(), List.of(BookingStatus.APPROVED))) {
            throw new ConflictException("Phòng đã có khách thuê.");
        }
        Booking booking = new Booking(room, tenant, request.moveInDate(), request.message());
        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> tenantBookings() {
        return bookingRepository.findByTenantIdOrderByCreatedAtDesc(currentUserService.getUser().getId())
                .stream().map(BookingResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> landlordBookings() {
        return bookingRepository.findByRoomLandlordIdOrderByCreatedAtDesc(currentUserService.getUser().getId())
                .stream().map(BookingResponse::from).toList();
    }

    @Transactional
    public BookingResponse decide(Long id, BookingDecisionRequest request) {
        if (request.status() != BookingStatus.APPROVED && request.status() != BookingStatus.REJECTED) {
            throw new BadRequestException("Chủ nhà chỉ có thể duyệt hoặc từ chối yêu cầu.");
        }
        Booking booking = findBooking(id);
        requireLandlord(booking);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ConflictException("Chỉ yêu cầu đang chờ mới có thể được xử lý.");
        }
        if (request.status() == BookingStatus.APPROVED) {
            // Serialize approvals for one room so two pending requests cannot both win.
            Room room = roomRepository.findByIdForUpdate(booking.getRoom().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng."));
            if (room.getStatus() != RoomStatus.AVAILABLE
                    || bookingRepository.existsByRoomIdAndStatusIn(booking.getRoom().getId(),
                    List.of(BookingStatus.APPROVED))) {
                throw new ConflictException("Phòng đã được cho thuê hoặc không còn khả dụng.");
            }
            room.setStatus(RoomStatus.RENTED);
        }
        booking.setStatus(request.status());
        return BookingResponse.from(booking);
    }

    @Transactional
    public BookingResponse cancel(Long id) {
        Booking booking = findBooking(id);
        User tenant = currentUserService.getUser();
        if (!booking.getTenant().getId().equals(tenant.getId())) {
            throw new ForbiddenException("Bạn không có quyền hủy yêu cầu này.");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ConflictException("Chỉ có thể hủy yêu cầu đang chờ xử lý.");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return BookingResponse.from(booking);
    }

    @Transactional
    public BookingResponse complete(Long id) {
        Booking booking = findBooking(id);
        requireLandlord(booking);
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new ConflictException("Chỉ có thể kết thúc lượt thuê đã được duyệt.");
        }
        booking.setStatus(BookingStatus.COMPLETED);
        booking.getRoom().setStatus(RoomStatus.AVAILABLE);
        return BookingResponse.from(booking);
    }

    private Booking findBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu đặt phòng."));
    }

    private void requireLandlord(Booking booking) {
        if (!booking.getRoom().getLandlord().getId().equals(currentUserService.getUser().getId())) {
            throw new ForbiddenException("Bạn không có quyền xử lý yêu cầu này.");
        }
    }
}
