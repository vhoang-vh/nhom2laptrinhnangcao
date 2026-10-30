package vn.rentify.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.rentify.dto.AuthResponse;
import vn.rentify.dto.LoginRequest;
import vn.rentify.dto.RegisterRequest;
import vn.rentify.dto.UserResponse;
import vn.rentify.entity.Role;
import vn.rentify.entity.User;
import vn.rentify.exception.BadRequestException;
import vn.rentify.exception.ConflictException;
import vn.rentify.repository.UserRepository;
import vn.rentify.security.JwtService;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public UserResponse register(RegisterRequest request) {
        Role role = request.role() == null ? Role.TENANT : request.role();
        if (role == Role.ADMIN) {
            throw new BadRequestException("Không thể đăng ký tài khoản ADMIN.");
        }
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email này đã được đăng ký.");
        }
        User user = new User(request.fullName().trim(), email, passwordEncoder.encode(request.password()),
                request.phone(), role, role == Role.TENANT);
        return UserResponse.from(userRepository.save(user));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email hoặc mật khẩu không chính xác."));
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(UserResponse.from(user), token);
    }
}
