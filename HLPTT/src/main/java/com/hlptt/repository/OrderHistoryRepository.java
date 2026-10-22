package com.hlptt.repository;

import com.hlptt.entity.OrderHistory;
import com.hlptt.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Integer> {
    // Lấy lịch sử, mới nhất xếp trên
    List<OrderHistory> findByOrderOrderByCreatedAtDesc(Order order);
}