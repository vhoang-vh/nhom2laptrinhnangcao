package vn.rentify.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.rentify.entity.Invoice;

import java.math.BigDecimal;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByTenantIdOrderByBillingMonthDesc(Long tenantId);
    List<Invoice> findByLandlordIdOrderByBillingMonthDesc(Long landlordId);
    boolean existsByRoomId(Long roomId);

    @Query("select coalesce(sum(i.totalAmount), 0) from Invoice i where i.status = vn.rentify.entity.InvoiceStatus.PAID")
    BigDecimal sumPaidInvoices();
}
