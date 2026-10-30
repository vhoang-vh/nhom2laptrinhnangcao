package vn.rentify.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private User tenant;

    @Column(nullable = false)
    private LocalDate moveInDate;

    @Column(length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected Booking() {
    }

    public Booking(Room room, User tenant, LocalDate moveInDate, String message) {
        this.room = room;
        this.tenant = tenant;
        this.moveInDate = moveInDate;
        this.message = message;
    }

    public Long getId() { return id; }
    public Room getRoom() { return room; }
    public User getTenant() { return tenant; }
    public LocalDate getMoveInDate() { return moveInDate; }
    public String getMessage() { return message; }
    public BookingStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setStatus(BookingStatus status) { this.status = status; }
}
