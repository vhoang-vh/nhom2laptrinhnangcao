package vn.rentify.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices", uniqueConstraints =
        @UniqueConstraint(columnNames = {"room_id", "tenant_id", "billing_month"}))
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private User tenant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;

    @Column(name = "billing_month", nullable = false)
    private LocalDate billingMonth;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal rentAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal electricityAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal waterAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal serviceAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvoiceStatus status = InvoiceStatus.UNPAID;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected Invoice() {
    }

    public Invoice(Room room, User tenant, User landlord, LocalDate billingMonth, BigDecimal rentAmount,
                   BigDecimal electricityAmount, BigDecimal waterAmount, BigDecimal serviceAmount) {
        this.room = room;
        this.tenant = tenant;
        this.landlord = landlord;
        this.billingMonth = billingMonth.withDayOfMonth(1);
        this.rentAmount = rentAmount;
        this.electricityAmount = electricityAmount;
        this.waterAmount = waterAmount;
        this.serviceAmount = serviceAmount;
        this.totalAmount = rentAmount.add(electricityAmount).add(waterAmount).add(serviceAmount);
    }

    public Long getId() { return id; }
    public Room getRoom() { return room; }
    public User getTenant() { return tenant; }
    public User getLandlord() { return landlord; }
    public LocalDate getBillingMonth() { return billingMonth; }
    public BigDecimal getRentAmount() { return rentAmount; }
    public BigDecimal getElectricityAmount() { return electricityAmount; }
    public BigDecimal getWaterAmount() { return waterAmount; }
    public BigDecimal getServiceAmount() { return serviceAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public InvoiceStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setStatus(InvoiceStatus status) { this.status = status; }
}
