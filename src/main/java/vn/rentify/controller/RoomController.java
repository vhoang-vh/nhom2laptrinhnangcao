package vn.rentify.controller;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.rentify.dto.RoomRequest;
import vn.rentify.dto.RoomResponse;
import vn.rentify.entity.RoomStatus;
import vn.rentify.service.RoomService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public Page<RoomResponse> search(@RequestParam(required = false) String area,
                                     @RequestParam(required = false) BigDecimal minPrice,
                                     @RequestParam(required = false) BigDecimal maxPrice,
                                     @RequestParam(required = false) BigDecimal minArea,
                                     @RequestParam(required = false) BigDecimal maxArea,
                                     @RequestParam(required = false) RoomStatus status,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "12") int size,
                                     @RequestParam(defaultValue = "createdAt") String sortBy,
                                     @RequestParam(defaultValue = "desc") String direction) {
        return roomService.search(area, minPrice, maxPrice, minArea, maxArea, status,
                page, size, sortBy, direction);
    }

    @GetMapping("/{id}")
    public RoomResponse findById(@PathVariable Long id) {
        return roomService.findById(id);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('LANDLORD')")
    public List<RoomResponse> findMine() {
        return roomService.findMine();
    }

    @PostMapping
    @PreAuthorize("hasRole('LANDLORD')")
    @ResponseStatus(HttpStatus.CREATED)
    public RoomResponse create(@Valid @RequestBody RoomRequest request) {
        return roomService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('LANDLORD')")
    public RoomResponse update(@PathVariable Long id, @Valid @RequestBody RoomRequest request) {
        return roomService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('LANDLORD')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        roomService.delete(id);
    }
}
