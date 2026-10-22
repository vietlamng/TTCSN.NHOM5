package com.hlptt.service;

import com.hlptt.dto.OrderRequestDTO;
import com.hlptt.entity.Order;
import com.hlptt.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface OrderService {

    Order createOrder(User user, OrderRequestDTO orderRequest);

    // Get orders with optional status filter
    Page<Order> getOrdersByUser(User user, String status, Pageable pageable);

    Optional<Order> getOrderById(Integer orderId);

    Optional<Order> getOrderByCode(String orderCode);

    Page<Order> getAllOrders(String keyword, String status, Pageable pageable);

    Order updateOrderStatus(Integer orderId, String status, String adminNote);

    // Customer actions
    Order completeOrder(Integer orderId, User user);

    Order cancelOrder(Integer orderId, User user);

    void deleteOrder(Integer id);
}