package vn.rentify.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.rentify.dto.AdminStatsResponse;
import vn.rentify.dto.RoomResponse;
import vn.rentify.dto.UserResponse;
import vn.rentify.entity.Role;
import vn.rentify.entity.RoomStatus;
import vn.rentify.entity.User;
import vn.rentify.exception.ConflictException;
import vn.rentify.exception.ResourceNotFoundException;
import vn.rentify.repository.BookingRepository;
import vn.rentify.repository.InvoiceRepository;
import vn.rentify.repository.RoomRepository;
import vn.rentify.repository.UserRepository;

import java.util.List;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final InvoiceRepository invoiceRepository;

    public AdminService(UserRepository userRepository, RoomRepository roomRepository,
                        BookingRepository bookingRepository, InvoiceRepository invoiceRepository) {
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> pendingLandlords() {
        return userRepository.findByRoleAndApprovedFalseOrderByCreatedAtAsc(Role.LANDLORD)
                .stream().map(UserResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> users() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> rooms() {
        return roomRepository.findAll().stream().map(RoomResponse::from).toList();
    }

    @Transactional
    public UserResponse decideLandlord(Long id, boolean approved) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản."));
        if (user.getRole() != Role.LANDLORD) {
            throw new ConflictException("Tài khoản này không phải chủ nhà.");
        }
        if (user.isApproved() == approved) {
            throw new ConflictException(approved ? "Tài khoản đã được duyệt." : "Tài khoản đã ở trạng thái chờ duyệt.");
        }
        user.setApproved(approved);
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public AdminStatsResponse stats() {
        return new AdminStatsResponse(userRepository.count(), userRepository.countByRole(Role.LANDLORD),
                userRepository.countByRoleAndApprovedFalse(Role.LANDLORD), roomRepository.count(),
                roomRepository.countByStatus(RoomStatus.AVAILABLE), bookingRepository.count(),
                bookingRepository.countByStatus(vn.rentify.entity.BookingStatus.PENDING),
                invoiceRepository.sumPaidInvoices());
    }
}
