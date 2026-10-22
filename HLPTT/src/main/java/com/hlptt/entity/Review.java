package com.hlptt.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Integer id;

    @Column(name = "rating", nullable = false)
    private Integer rating; // 1 đến 5 sao

    @Column(name = "title", length = 200)
    private String title;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "is_verified_purchase")
    private Boolean isVerifiedPurchase = false;

    @Column(name = "is_approved")
    private Boolean isApproved = true; // Mặc định hiện luôn, admin ẩn sau nếu cần

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // --- QUAN HỆ ---

    @ManyToOne(fetch = FetchType.EAGER) // EAGER để lấy luôn tên sản phẩm
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({ "description", "content", "reviews", "productAttributes", "category", "brand" }) // Chỉ lấy
                                                                                                             // thông
                                                                                                             // tin cơ
                                                                                                             // bản của
                                                                                                             // Product
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER) // EAGER để lấy luôn tên người review
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({ "password", "cart", "roles", "tokens", "orders" }) // Ẩn thông tin nhạy cảm của User
    private User user;

    // Lưu review này thuộc về đơn hàng nào (để tránh spam đánh giá nhiều lần cho 1
    // đơn)
    @Column(name = "order_id")
    private Integer orderId;
}