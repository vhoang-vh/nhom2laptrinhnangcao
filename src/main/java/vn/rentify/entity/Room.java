package vn.rentify.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(nullable = false, length = 100)
    private String area;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyRent;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal areaSquareMeters;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomStatus status = RoomStatus.AVAILABLE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected Room() {
    }

    public Room(User landlord, String title, String address, String area, BigDecimal monthlyRent,
                BigDecimal areaSquareMeters, String description, RoomStatus status) {
        this.landlord = landlord;
        this.title = title;
        this.address = address;
        this.area = area;
        this.monthlyRent = monthlyRent;
        this.areaSquareMeters = areaSquareMeters;
        this.description = description;
        this.status = status;
    }

    public Long getId() { return id; }
    public User getLandlord() { return landlord; }
    public String getTitle() { return title; }
    public String getAddress() { return address; }
    public String getArea() { return area; }
    public BigDecimal getMonthlyRent() { return monthlyRent; }
    public BigDecimal getAreaSquareMeters() { return areaSquareMeters; }
    public String getDescription() { return description; }
    public RoomStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void update(String title, String address, String area, BigDecimal monthlyRent,
                       BigDecimal areaSquareMeters, String description, RoomStatus status) {
        this.title = title;
        this.address = address;
        this.area = area;
        this.monthlyRent = monthlyRent;
        this.areaSquareMeters = areaSquareMeters;
        this.description = description;
        this.status = status;
    }
    public void setStatus(RoomStatus status) { this.status = status; }
}
