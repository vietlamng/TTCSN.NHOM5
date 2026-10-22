package com.hlptt.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Import này
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_id")
    private Integer orderItemId; // Đã sửa thành orderItemId

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore // <--- QUAN TRỌNG: Cắt đứt vòng lặp tại đây
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER) // Để Eager để lấy luôn tên/ảnh sp
    @JoinColumn(name = "product_id")
    // Chặn không cho load tiếp các list con của Product để JSON gọn nhẹ
    @JsonIgnoreProperties({"productAttributes", "reviews", "category", "brand", "hibernateLazyInitializer", "handler"})
    private Product product;

    @Column(name = "product_name", length = 200, nullable = false)
    private String productName;

    @Column(name = "product_sku", length = 50)
    private String productSku;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "total_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalPrice;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt; 

}