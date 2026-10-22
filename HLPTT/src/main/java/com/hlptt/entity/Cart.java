package com.hlptt.entity;

import jakarta.persistence.*;
import lombok.Getter; // <-- SỬA TỪ @Data
import lombok.Setter; // <-- SỬA TỪ @Data
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode; // Cần thiết để fix lỗi
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "carts")
// LOẠI TRỪ MỌI QUAN HỆ KHỎI HASHCODE
@EqualsAndHashCode(exclude = { "user", "cartItems" })
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_id")
    private Integer cartId;

    @Column(name = "session_id")
    private String sessionId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    @JsonIgnore // Cần thiết để Order JSON không bị lỗi User->Cart->Order
    private User user;

    // --- FIX 1: DÙNG EAGER ĐỂ KHÔNG BỊ LỖI NullPointer TRONG SERVICE ---
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<CartItem> cartItems = new LinkedHashSet<>();

    // --- Phương thức trợ giúp ---
    public void addCartItem(CartItem item) {
        cartItems.add(item);
        item.setCart(this);
    }

    public void removeCartItem(CartItem item) {
        cartItems.remove(item);
        item.setCart(null);
    }
}