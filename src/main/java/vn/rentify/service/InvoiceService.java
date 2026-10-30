package vn.rentify.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.rentify.dto.InvoiceRequest;
import vn.rentify.dto.InvoiceResponse;
import vn.rentify.entity.*;
import vn.rentify.exception.BadRequestException;
import vn.rentify.exception.ConflictException;
import vn.rentify.exception.ForbiddenException;
import vn.rentify.exception.ResourceNotFoundException;
import vn.rentify.repository.BookingRepository;
import vn.rentify.repository.InvoiceRepository;
import vn.rentify.repository.RoomRepository;
import vn.rentify.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final CurrentUserService currentUserService;

    public InvoiceService(InvoiceRepository invoiceRepository, RoomRepository roomRepository,
                          UserRepository userRepository, BookingRepository bookingRepository,
                          CurrentUserService currentUserService) {
        this.invoiceRepository = invoiceRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public InvoiceResponse create(InvoiceRequest request) {
        User landlord = currentUserService.getUser();
        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng."));
        if (!room.getLandlord().getId().equals(landlord.getId())) {
            throw new ForbiddenException("Bạn không có quyền lập hóa đơn cho phòng này.");
        }
        User tenant = userRepository.findById(request.tenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách thuê."));
        if (!bookingRepository.existsByRoomIdAndTenantIdAndStatusIn(room.getId(), tenant.getId(),
                List.of(BookingStatus.APPROVED))) {
            throw new BadRequestException("Chỉ có thể lập hóa đơn cho khách đang thuê phòng.");
        }
        LocalDate billingMonth = request.billingMonth().withDayOfMonth(1);
        if (billingMonth.isAfter(LocalDate.now().withDayOfMonth(1))) {
            throw new BadRequestException("Không thể tạo hóa đơn cho tháng trong tương lai.");
        }
        Invoice invoice = new Invoice(room, tenant, landlord, billingMonth, room.getMonthlyRent(),
                request.electricityAmount(), request.waterAmount(), request.serviceAmount());
        return InvoiceResponse.from(invoiceRepository.save(invoice));
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> tenantInvoices() {
        return invoiceRepository.findByTenantIdOrderByBillingMonthDesc(currentUserService.getUser().getId())
                .stream().map(InvoiceResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> landlordInvoices() {
        return invoiceRepository.findByLandlordIdOrderByBillingMonthDesc(currentUserService.getUser().getId())
                .stream().map(InvoiceResponse::from).toList();
    }

    @Transactional
    public InvoiceResponse markPaid(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn."));
        if (!invoice.getTenant().getId().equals(currentUserService.getUser().getId())) {
            throw new ForbiddenException("Bạn không có quyền cập nhật hóa đơn này.");
        }
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new ConflictException("Hóa đơn này đã được thanh toán.");
        }
        invoice.setStatus(InvoiceStatus.PAID);
        return InvoiceResponse.from(invoice);
    }
}
