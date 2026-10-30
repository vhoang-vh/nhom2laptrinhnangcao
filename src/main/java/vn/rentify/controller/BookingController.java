package vn.rentify.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.rentify.dto.BookingDecisionRequest;
import vn.rentify.dto.BookingRequest;
import vn.rentify.dto.BookingResponse;
import vn.rentify.service.BookingService;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('TENANT')")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(@Valid @RequestBody BookingRequest request) {
        return bookingService.create(request);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('TENANT')")
    public List<BookingResponse> tenantBookings() {
        return bookingService.tenantBookings();
    }

    @GetMapping("/landlord")
    @PreAuthorize("hasRole('LANDLORD')")
    public List<BookingResponse> landlordBookings() {
        return bookingService.landlordBookings();
    }

    @PatchMapping("/{id}/decision")
    @PreAuthorize("hasRole('LANDLORD')")
    public BookingResponse decide(@PathVariable Long id, @Valid @RequestBody BookingDecisionRequest request) {
        return bookingService.decide(id, request);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('TENANT')")
    public BookingResponse cancel(@PathVariable Long id) {
        return bookingService.cancel(id);
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('LANDLORD')")
    public BookingResponse complete(@PathVariable Long id) {
        return bookingService.complete(id);
    }
}
