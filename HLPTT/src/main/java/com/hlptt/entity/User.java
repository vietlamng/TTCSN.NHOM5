package com.hlptt.entity;

import jakarta.persistence.*;
import lombok.Getter; // <-- SỬA TỪ @Data
import lombok.Setter; // <-- SỬA TỪ @Data
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode; // Cần thiết để fix lỗi
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
// Nếu User có mối quan hệ @OneToMany với Order/OrderHistory, cần loại trừ chúng
@EqualsAndHashCode(exclude = { "cart", "orders" })
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "avatar", length = 255)
    private String avatar;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "email_verified")
    private Boolean emailVerified;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(name = "verification_code", length = 10)
    private String verificationCode;

    @Column(name = "code_expires")
    private LocalDateTime codeExpires;

    @Column(name = "password_reset_token", length = 100)
    private String passwordResetToken;

    @Column(name = "password_reset_expires")
    private LocalDateTime passwordResetExpires;

    // Giả sử có quan hệ OneToOne với Cart và OneToMany với Order (cần phải fix ở
    // đây)
    // @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch =
    // FetchType.LAZY)
    // private Cart cart;

    // @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    // private Set<Order> orders;
}