package vn.rentify.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.rentify.entity.*;
import vn.rentify.repository.RoomRepository;
import vn.rentify.repository.UserRepository;

import java.math.BigDecimal;

@Configuration
@Profile("demo")
public class DemoDataInitializer {
    @Bean
    CommandLineRunner createDemoRooms(UserRepository users, RoomRepository rooms, PasswordEncoder encoder) {
        return args -> {
            User landlord = users.findByEmail("chunha@rentify.local").orElseGet(() ->
                    users.save(new User("Nguyễn Minh Anh", "chunha@rentify.local",
                            encoder.encode("Landlord123!"), "0901234567", Role.LANDLORD, true)));

            if (rooms.count() > 0) {
                return;
            }

            rooms.save(new Room(landlord, "Studio ban công đầy nắng",
                    "25 Nguyễn Văn Cừ, Phường 1, Quận 5, TP. Hồ Chí Minh", "Quận 5",
                    new BigDecimal("4500000"), new BigDecimal("28"),
                    "Studio thoáng mát, cửa sổ lớn, đầy đủ nội thất. Gần trường đại học và tuyến xe buýt.", RoomStatus.AVAILABLE));
            rooms.save(new Room(landlord, "Căn hộ mini gần công viên",
                    "88 Võ Thị Sáu, Phường Tân Định, Quận 1, TP. Hồ Chí Minh", "Quận 1",
                    new BigDecimal("7500000"), new BigDecimal("38"),
                    "Căn hộ có bếp riêng, máy lạnh, máy giặt và bảo vệ 24/7. Hợp đồng linh hoạt.", RoomStatus.AVAILABLE));
            rooms.save(new Room(landlord, "Phòng tiện nghi gần Làng Đại học",
                    "Đường Tô Vĩnh Diện, Phường Đông Hòa, TP. Dĩ An, Bình Dương", "TP. Dĩ An",
                    new BigDecimal("2800000"), new BigDecimal("22"),
                    "Phòng sạch đẹp, có gác lửng, chỗ để xe an toàn và wifi. Cách Làng Đại học vài phút.", RoomStatus.AVAILABLE));
            rooms.save(new Room(landlord, "Phòng yên tĩnh có nội thất",
                    "120 Nguyễn Đình Chiểu, Phường 6, Quận 3, TP. Hồ Chí Minh", "Quận 3",
                    new BigDecimal("5200000"), new BigDecimal("30"),
                    "Không gian riêng tư, nội thất cơ bản, cửa sổ thoáng. Gần chợ và các cửa hàng tiện ích.", RoomStatus.AVAILABLE));
        };
    }
}
