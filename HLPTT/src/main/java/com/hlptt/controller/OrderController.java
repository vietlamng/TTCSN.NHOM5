package com.hlptt.controller;

import com.hlptt.dto.OrderRequestDTO;
import com.hlptt.entity.Order;
import com.hlptt.entity.User;
import com.hlptt.repository.UserRepository;
import com.hlptt.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;
    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // === ADMIN API ===

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Order>> getAllOrders(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(orderService.getAllOrders(keyword, status, pageable));
    }

    // API Cập nhật trạng thái (Có thể nhận Note)
    // Body: { "status": "COMPLETED", "note": "Khách đã nhận hàng" }
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String note = body.get("note"); // Lấy ghi chú từ body
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status, note));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteOrder(@PathVariable Integer id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok("Đã xóa đơn hàng");
    }

    // === CLIENT API ===

    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Order> createOrder(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody OrderRequestDTO dto) {
        return ResponseEntity.ok(orderService.createOrder(getCurrentUser(userDetails), dto));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<Order>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return ResponseEntity.ok(orderService.getOrdersByUser(getCurrentUser(userDetails), status, pageable));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> completeOrder(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Order order = orderService.completeOrder(id, getCurrentUser(userDetails));
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Order order = orderService.cancelOrder(id, getCurrentUser(userDetails));
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()") // Chỉ cần đăng nhập là vào hàm này
    public ResponseEntity<?> getOrderById(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        // 1. Lấy user hiện tại đang gọi API
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Lấy đơn hàng cần xem
        Order order = orderService.getOrderById(id)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        // 3. KIỂM TRA QUYỀN (Logic mới chuẩn hơn)

        // Check xem user này có phải ADMIN không? (Dựa vào Role name hoặc Role ID)
        // Giả sử role 1 là ADMIN, role 2 là CUSTOMER
        boolean isAdmin = currentUser.getRole().getRoleId() == 1 ||
                "ADMIN".equalsIgnoreCase(currentUser.getRole().getRoleName());

        // Check xem user này có phải chủ đơn hàng không?
        boolean isOwner = order.getUser().getUserId().equals(currentUser.getUserId());

        // Nếu KHÔNG PHẢI Admin VÀ cũng KHÔNG PHẢI Chủ đơn -> Chặn
        if (!isAdmin && !isOwner) {
            return ResponseEntity.status(403).body("Bạn không có quyền xem chi tiết đơn hàng này.");
        }

        return ResponseEntity.ok(order);
    }
}