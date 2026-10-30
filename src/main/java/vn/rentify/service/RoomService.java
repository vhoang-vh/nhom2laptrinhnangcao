package vn.rentify.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.rentify.dto.RoomRequest;
import vn.rentify.dto.RoomResponse;
import vn.rentify.entity.Room;
import vn.rentify.entity.RoomStatus;
import vn.rentify.entity.User;
import vn.rentify.exception.BadRequestException;
import vn.rentify.exception.ConflictException;
import vn.rentify.exception.ForbiddenException;
import vn.rentify.exception.ResourceNotFoundException;
import vn.rentify.repository.BookingRepository;
import vn.rentify.repository.InvoiceRepository;
import vn.rentify.repository.RoomRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Service
public class RoomService {
    private static final Set<String> SORT_FIELDS =
            Set.of("monthlyRent", "areaSquareMeters", "createdAt", "title");
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final InvoiceRepository invoiceRepository;
    private final CurrentUserService currentUserService;

    public RoomService(RoomRepository roomRepository, BookingRepository bookingRepository,
                       InvoiceRepository invoiceRepository, CurrentUserService currentUserService) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.invoiceRepository = invoiceRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public Page<RoomResponse> search(String area, BigDecimal minPrice, BigDecimal maxPrice,
                                     BigDecimal minArea, BigDecimal maxArea, RoomStatus status,
                                     int page, int size, String sortBy, String direction) {
        if (page < 0 || size < 1 || size > 100) {
            throw new BadRequestException("page phải từ 0 và size phải nằm trong khoảng 1 đến 100.");
        }
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException("minPrice không được lớn hơn maxPrice.");
        }
        if (minArea != null && maxArea != null && minArea.compareTo(maxArea) > 0) {
            throw new BadRequestException("minArea không được lớn hơn maxArea.");
        }
        if (!SORT_FIELDS.contains(sortBy)) {
            throw new BadRequestException("sortBy chỉ hỗ trợ: " + String.join(", ", SORT_FIELDS));
        }
        Sort.Direction sortDirection;
        try {
            sortDirection = Sort.Direction.fromString(direction);
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException("direction chỉ nhận asc hoặc desc.");
        }
        Specification<Room> specification = (root, query, builder) -> builder.conjunction();
        if (area != null && !area.isBlank()) {
            String pattern = "%" + area.trim().toLowerCase() + "%";
            specification = specification.and((root, query, builder) -> builder.or(
                    builder.like(builder.lower(root.get("area")), pattern),
                    builder.like(builder.lower(root.get("address")), pattern)));
        }
        if (minPrice != null) {
            specification = specification.and((root, query, builder) ->
                    builder.greaterThanOrEqualTo(root.get("monthlyRent"), minPrice));
        }
        if (maxPrice != null) {
            specification = specification.and((root, query, builder) ->
                    builder.lessThanOrEqualTo(root.get("monthlyRent"), maxPrice));
        }
        if (minArea != null) {
            specification = specification.and((root, query, builder) ->
                    builder.greaterThanOrEqualTo(root.get("areaSquareMeters"), minArea));
        }
        if (maxArea != null) {
            specification = specification.and((root, query, builder) ->
                    builder.lessThanOrEqualTo(root.get("areaSquareMeters"), maxArea));
        }
        if (status != null) {
            specification = specification.and((root, query, builder) ->
                    builder.equal(root.get("status"), status));
        } else {
            specification = specification.and((root, query, builder) ->
                    builder.equal(root.get("status"), RoomStatus.AVAILABLE));
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        return roomRepository.findAll(specification, pageable).map(RoomResponse::from);
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> findMine() {
        return roomRepository.findByLandlordIdOrderByCreatedAtDesc(currentUserService.getUser().getId())
                .stream().map(RoomResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public RoomResponse findById(Long id) {
        return RoomResponse.from(roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng.")));
    }

    @Transactional
    public RoomResponse create(RoomRequest request) {
        User landlord = currentUserService.getUser();
        if (request.status() == RoomStatus.RENTED) {
            throw new BadRequestException("Trạng thái Đã thuê chỉ được cập nhật khi duyệt yêu cầu đặt phòng.");
        }
        Room room = new Room(landlord, request.title().trim(), request.address().trim(), request.area().trim(),
                request.monthlyRent(), request.areaSquareMeters(), request.description(),
                request.status() == null ? RoomStatus.AVAILABLE : request.status());
        return RoomResponse.from(roomRepository.save(room));
    }

    @Transactional
    public RoomResponse update(Long id, RoomRequest request) {
        Room room = findOwnedRoom(id);
        RoomStatus status = request.status() == null ? room.getStatus() : request.status();
        if (status == RoomStatus.RENTED && room.getStatus() != RoomStatus.RENTED) {
            throw new BadRequestException("Trạng thái Đã thuê chỉ được cập nhật khi duyệt yêu cầu đặt phòng.");
        }
        if (room.getStatus() == RoomStatus.RENTED && status != RoomStatus.RENTED) {
            throw new ConflictException("Phòng đang có khách thuê; hãy kết thúc lượt thuê trước.");
        }
        room.update(request.title().trim(), request.address().trim(), request.area().trim(),
                request.monthlyRent(), request.areaSquareMeters(), request.description(), status);
        return RoomResponse.from(room);
    }

    @Transactional
    public void delete(Long id) {
        Room room = findOwnedRoom(id);
        if (bookingRepository.existsByRoomId(id) || invoiceRepository.existsByRoomId(id)) {
            throw new ConflictException("Không thể xóa phòng đã có lịch sử đặt phòng hoặc hóa đơn.");
        }
        roomRepository.delete(room);
    }

    private Room findOwnedRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng."));
        if (!room.getLandlord().getId().equals(currentUserService.getUser().getId())) {
            throw new ForbiddenException("Bạn không có quyền quản lý phòng này.");
        }
        return room;
    }
}
