package com.hlptt.repository;

import com.hlptt.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OrderStatusRepository extends JpaRepository<OrderStatus, Integer> {
    Optional<OrderStatus> findByStatusName(String statusName);
    Optional<OrderStatus> findByStatusNameIgnoreCase(String statusName);
}