package com.hlptt.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order; // JPA sẽ tự hiểu mapping với cột order_id của Order entity

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // JPA sẽ tự hiểu mapping với cột user_id của User entity

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "transaction_ref")
    private String transactionRef;

    @Column(name = "transaction_no")
    private String transactionNo;

    private BigDecimal amount;

    private String status;

    @Column(name = "payment_time")
    private LocalDateTime paymentTime;
}