package com.hlptt.service.impl;

import com.hlptt.dto.OrderItemDto;
import com.hlptt.dto.OrderRequestDTO;
import com.hlptt.entity.*;
import com.hlptt.exception.ResourceNotFoundException;
import com.hlptt.repository.*;
import com.hlptt.service.CouponService;
import com.hlptt.service.EmailService;
import com.hlptt.service.OrderService;
import com.hlptt.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderStatusRepository orderStatusRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private CouponService couponService;
    @Autowired
    private EmailService emailService;

    // Thay vì dùng CartRepository, ta dùng ProductRepository để tra giá
    @Autowired
    private ProductRepository productRepository;

    @Override
    @Transactional
    public Order createOrder(User user, OrderRequestDTO dto) {
        // 1. Kiểm tra danh sách sản phẩm gửi lên
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new RuntimeException("Danh sách sản phẩm trống!");
        }

        // 2. Khởi tạo đơn hàng
        Order order = new Order();
        order.setUser(user);
        order.setOrderCode("ORD-" + System.currentTimeMillis());

        order.setShippingFullName(dto.getShippingFullName());
        order.setShippingPhone(dto.getShippingPhone());
        order.setShippingEmail(dto.getShippingEmail());
        order.setShippingAddress(dto.getShippingAddress());
        order.setShippingCity(dto.getShippingCity());
        order.setShippingDistrict(dto.getShippingDistrict());
        order.setShippingWard(dto.getShippingWard());
        order.setNote(dto.getNote());
        order.setPaymentMethod(dto.getPaymentMethod());
        order.setPaymentStatus("PENDING");

        // 3. Tính toán tổng tiền & Tạo OrderItem
        BigDecimal subtotal = BigDecimal.ZERO;

        // Lưu Order trước để có ID gán cho OrderItem
        // Auto-confirm: Đơn hàng được xác nhận tự động khi khách đặt
        OrderStatus confirmedStatus = orderStatusRepository.findByStatusNameIgnoreCase("confirmed")
                .orElseThrow(() -> new RuntimeException("Lỗi trạng thái đơn hàng"));
        order.setStatus(confirmedStatus);

        // Tạm set total = 0 để save được order (có ID)
        order.setSubtotal(BigDecimal.ZERO);
        order.setTotalAmount(BigDecimal.ZERO);

        Order savedOrder = orderRepository.save(order);

        // Duyệt danh sách items từ Frontend gửi lên
        for (OrderItemDto itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại ID: " + itemDto.getProductId()));

            // Kiểm tra số lượng đặt hàng hợp lệ
            if (itemDto.getQuantity() == null || itemDto.getQuantity() <= 0) {
                throw new RuntimeException("Số lượng sản phẩm không hợp lệ!");
            }

            // Kiểm tra tồn kho - QUAN TRỌNG: Phải đủ hàng mới cho đặt
            Integer currentStock = product.getStockQuantity();
            if (currentStock == null || currentStock < itemDto.getQuantity()) {
                throw new RuntimeException("Sản phẩm \"" + product.getProductName() +
                        "\" chỉ còn " + (currentStock != null ? currentStock : 0) +
                        " sản phẩm, không đủ để đặt " + itemDto.getQuantity() + " sản phẩm!");
            }

            // TRỪ KHO - CRITICAL: Giảm stock_quantity trong database
            int newStock = currentStock - itemDto.getQuantity();
            product.setStockQuantity(newStock);
            productRepository.save(product);

            // Tạo OrderItem
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getProductName());
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setUnitPrice(product.getPrice()); // Lấy giá từ DB cho an toàn

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            orderItem.setTotalPrice(itemTotal);

            orderItemRepository.save(orderItem);

            subtotal = subtotal.add(itemTotal);
        }

        // 4. Cập nhật lại Tổng tiền & Mã giảm giá
        savedOrder.setSubtotal(subtotal);

        BigDecimal discountAmount = BigDecimal.ZERO;
        if (dto.getCouponCode() != null && !dto.getCouponCode().isEmpty()) {
            discountAmount = couponService.calculateDiscount(dto.getCouponCode(), subtotal);
            couponService.markCouponAsUsed(dto.getCouponCode(), user, savedOrder, discountAmount);
        }
        savedOrder.setDiscountAmount(discountAmount);

        BigDecimal finalTotal = subtotal.subtract(discountAmount);
        if (finalTotal.compareTo(BigDecimal.ZERO) < 0)
            finalTotal = BigDecimal.ZERO;

        savedOrder.setTotalAmount(finalTotal);

        return orderRepository.save(savedOrder);
    }

    // ... (Các hàm getOrdersByUser, getOrderById, getAllOrders... giữ nguyên như
    // cũ) ...
    @Override
    public Page<Order> getOrdersByUser(User user, String status, Pageable pageable) {
        if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            // Filter by status
            return orderRepository.findByUserAndStatus_StatusName(user, status, pageable);
        }
        // Return all orders
        return orderRepository.findByUser(user, pageable);
    }

    @Override
    public Optional<Order> getOrderById(Integer orderId) {
        return orderRepository.findById(orderId);
    }

    @Override
    public Optional<Order> getOrderByCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode);
    }

    @Override
    public Page<Order> getAllOrders(String keyword, String status, Pageable pageable) {
        return orderRepository.searchOrders(keyword, status, pageable);
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Integer orderId, String status, String adminNote) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

        // Validate: Không thể update đơn đã CANCELLED (trừ khi admin muốn revert về
        // trạng thái khác)
        String currentStatus = order.getStatus().getStatusName();
        if ("CANCELLED".equalsIgnoreCase(currentStatus) && !"CANCELLED".equalsIgnoreCase(status)) {
            throw new RuntimeException("Không thể cập nhật trạng thái của đơn hàng đã bị hủy");
        }

        // Find new status from database
        OrderStatus newStatus = orderStatusRepository.findByStatusNameIgnoreCase(status)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trạng thái: " + status));

        order.setStatus(newStatus);

        if ("COMPLETED".equalsIgnoreCase(status)) {
            order.setPaymentStatus("PAID");
            order.setCompletedAt(LocalDateTime.now());
        } else if ("CANCELLED".equalsIgnoreCase(status)) {
            // QUAN TRỌNG: Khi hủy đơn, phải HOÀN TRẢ stock về kho
            restoreStockForCancelledOrder(order);

            order.setPaymentStatus("FAILED");
            order.setCancelledAt(LocalDateTime.now());
        }

        if (adminNote != null && !adminNote.isEmpty()) {
            order.setAdminNote(adminNote);
        }

        Order updatedOrder = orderRepository.save(order);

        // GỬI EMAIL THÔNG BÁO CHO KHÁCH HÀNG
        try {
            emailService.sendOrderStatusUpdateEmail(updatedOrder, status);
        } catch (Exception e) {
            System.err.println("Lỗi gửi email: " + e.getMessage());
            // Không throw exception để không ảnh hưởng đến việc cập nhật đơn
        }

        return updatedOrder;
    }

    /**
     * Hoàn trả stock khi đơn hàng bị hủy
     * CRITICAL: Tránh mất hàng khi khách hủy đơn
     */
    private void restoreStockForCancelledOrder(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            return;
        }

        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            if (product != null && item.getQuantity() != null) {
                // Cộng lại số lượng đã đặt vào kho
                Integer currentStock = product.getStockQuantity();
                if (currentStock == null) {
                    currentStock = 0;
                }
                product.setStockQuantity(currentStock + item.getQuantity());
                productRepository.save(product);
            }
        }
    }

    @Override
    @Transactional
    public Order completeOrder(Integer orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

        // Validate ownership
        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Bạn không có quyền thao tác đơn hàng này");
        }

        // Validate status - only SHIPPING orders can be completed by customer
        String currentStatus = order.getStatus().getStatusName();
        if (!"SHIPPING".equalsIgnoreCase(currentStatus) &&
                !"CONFIRMED".equalsIgnoreCase(currentStatus) &&
                !"SHIPPED".equalsIgnoreCase(currentStatus)) {
            throw new RuntimeException("Chỉ có thể xác nhận nhận hàng cho đơn đang giao");
        }

        // Find COMPLETED status
        OrderStatus completedStatus = orderStatusRepository.findByStatusNameIgnoreCase("COMPLETED")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trạng thái COMPLETED"));

        order.setStatus(completedStatus);
        order.setPaymentStatus("PAID");
        order.setCompletedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order cancelOrder(Integer orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

        // Validate ownership
        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Bạn không có quyền thao tác đơn hàng này");
        }

        // Validate status - only CONFIRMED/PENDING orders can be cancelled by customer
        String currentStatus = order.getStatus().getStatusName();
        if (!"CONFIRMED".equalsIgnoreCase(currentStatus) && !"PENDING".equalsIgnoreCase(currentStatus) && !"NEW".equalsIgnoreCase(currentStatus)) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng chưa được giao");
        }

        // Restore stock
        restoreStockForCancelledOrder(order);

        // Find CANCELLED status
        OrderStatus cancelledStatus = orderStatusRepository.findByStatusNameIgnoreCase("CANCELLED")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trạng thái CANCELLED"));

        order.setStatus(cancelledStatus);
        order.setPaymentStatus("FAILED");
        order.setCancelledAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    @Override
    public void deleteOrder(Integer id) {
        orderRepository.deleteById(id);
    }
}