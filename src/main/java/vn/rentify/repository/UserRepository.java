package vn.rentify.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.rentify.entity.Role;
import vn.rentify.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(Role role);
    long countByRoleAndApprovedFalse(Role role);
    List<User> findByRoleAndApprovedFalseOrderByCreatedAtAsc(Role role);
}
