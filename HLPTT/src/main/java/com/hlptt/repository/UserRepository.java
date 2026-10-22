package com.hlptt.repository;

import com.hlptt.entity.User;
import org.springframework.data.domain.Page;         // <--- Thêm import này
import org.springframework.data.domain.Pageable;     // <--- Thêm import này
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPasswordResetToken(String token);

    Page<User> findByEmailContainingOrFullNameContaining(String email, String fullName, Pageable pageable);
    
    boolean existsByEmail(String email);
    
    // ==================== DASHBOARD STATISTICS QUERIES ====================
    
    /**
     * Count users (customers) created after a specific date
     * Used for: New customers this week
     */
    long countByCreatedAtAfter(LocalDateTime date);
    
    /**
     * Count users created between two dates
     * Used for: Comparing with previous period
     */
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}