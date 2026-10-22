package com.hlptt.repository;

import com.hlptt.entity.Cart;
import com.hlptt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // <-- THÊM IMPORT NÀY
import org.springframework.data.repository.query.Param; // <-- THÊM IMPORT NÀY
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Integer> {

    Optional<Cart> findByUserUserId(Integer userId);

    Optional<Cart> findByUser(User user);

    // --- THÊM PHƯƠNG THỨC MỚI NÀY ---
    // Phương thức này sẽ tải Cart, CartItems, và Product cùng 1 lúc
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.cartItems ci LEFT JOIN FETCH ci.product WHERE c.user = :user")
    Optional<Cart> findByUserWithItemsAndProducts(@Param("user") User user);
}