package vn.rentify.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.rentify.entity.Role;
import vn.rentify.entity.User;
import vn.rentify.repository.UserRepository;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner createInitialAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                         @Value("${app.admin.email}") String email,
                                         @Value("${app.admin.password}") String password) {
        return args -> {
            if (!userRepository.existsByEmail(email)) {
                userRepository.save(new User("Rentify Administrator", email.toLowerCase(),
                        passwordEncoder.encode(password), null, Role.ADMIN, true));
            }
        };
    }
}
