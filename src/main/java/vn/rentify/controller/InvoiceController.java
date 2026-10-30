package vn.rentify.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.rentify.dto.InvoiceRequest;
import vn.rentify.dto.InvoiceResponse;
import vn.rentify.service.InvoiceService;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {
    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping
    @PreAuthorize("hasRole('LANDLORD')")
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceResponse create(@Valid @RequestBody InvoiceRequest request) {
        return invoiceService.create(request);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('TENANT')")
    public List<InvoiceResponse> tenantInvoices() {
        return invoiceService.tenantInvoices();
    }

    @GetMapping("/landlord")
    @PreAuthorize("hasRole('LANDLORD')")
    public List<InvoiceResponse> landlordInvoices() {
        return invoiceService.landlordInvoices();
    }

    @PatchMapping("/{id}/paid")
    @PreAuthorize("hasRole('TENANT')")
    public InvoiceResponse markPaid(@PathVariable Long id) {
        return invoiceService.markPaid(id);
    }
}
