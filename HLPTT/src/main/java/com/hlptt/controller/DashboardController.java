package com.hlptt.controller;

import com.hlptt.dto.DashboardStatsDto;
import com.hlptt.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Dashboard Statistics
 * All endpoints require ADMIN role
 */
@RestController
@CrossOrigin("*")
@RequestMapping("/api/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Get overview statistics for dashboard
     * 
     * Endpoint: GET /api/dashboard/stats
     * Auth: Admin only
     * 
     * Response format:
     * {
     * "newOrders": { "count": 12, "change": 8.0 },
     * "monthRevenue": { "amount": 245800000, "change": 15.0 },
     * "newCustomers": { "count": 28, "change": 12.0 },
     * "productsSold": { "count": 156, "change": 0.0 }
     * }
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        try {
            log.info("GET /api/dashboard/stats - Admin dashboard stats request");
            DashboardStatsDto stats = dashboardService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error in /api/dashboard/stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Không thể tải thống kê. Vui lòng thử lại sau."));
        }
    }

    /**
     * Get revenue data for 12 months
     * 
     * Endpoint: GET /api/dashboard/revenue-by-month?year=2025
     * Auth: Admin only
     * Query Params:
     * - year (optional): Target year, defaults to current year
     * 
     * Response format:
     * {
     * "labels": ["T1", "T2", ..., "T12"],
     * "data": [45.5, 52.3, ..., 67.8], // in millions VND
     * "year": 2025
     * }
     */
    @GetMapping("/revenue-by-month")
    public ResponseEntity<?> getRevenueByMonth(
            @RequestParam(required = false) Integer year) {
        try {
            log.info("GET /api/dashboard/revenue-by-month - Year: {}", year);
            Map<String, Object> revenueData = dashboardService.getRevenueByMonth(year);
            return ResponseEntity.ok(revenueData);
        } catch (Exception e) {
            log.error("Error in /api/dashboard/revenue-by-month", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Không thể tải dữ liệu doanh thu. Vui lòng thử lại sau."));
        }
    }

    /**
     * Get product distribution by category
     * 
     * Endpoint: GET /api/dashboard/products-by-category
     * Auth: Admin only
     * 
     * Response format:
     * {
     * "labels": ["Rau củ", "Trái cây", "Thịt cá"],
     * "data": [45, 32, 28],
     * "totalProducts": 105
     * }
     */
    @GetMapping("/products-by-category")
    public ResponseEntity<?> getProductsByCategory() {
        try {
            log.info("GET /api/dashboard/products-by-category");
            Map<String, Object> categoryData = dashboardService.getProductsByCategory();
            return ResponseEntity.ok(categoryData);
        } catch (Exception e) {
            log.error("Error in /api/dashboard/products-by-category", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau."));
        }
    }

    /**
     * Get order counts for the last 30 days
     * 
     * Endpoint: GET /api/dashboard/orders-last-30-days
     * Auth: Admin only
     * 
     * Response format:
     * {
     * "labels": ["Ngày 1", "Ngày 2", ..., "Ngày 30"],
     * "data": [5, 8, 3, 12, ...]
     * }
     */
    @GetMapping("/orders-last-30-days")
    public ResponseEntity<?> getOrdersLast30Days() {
        try {
            log.info("GET /api/dashboard/orders-last-30-days");
            Map<String, Object> ordersData = dashboardService.getOrdersLast30Days();
            return ResponseEntity.ok(ordersData);
        } catch (Exception e) {
            log.error("Error in /api/dashboard/orders-last-30-days", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Không thể tải dữ liệu đơn hàng. Vui lòng thử lại sau."));
        }
    }

    /**
     * Get top selling products
     * 
     * Endpoint: GET /api/dashboard/top-products?limit=5
     * Auth: Admin only
     * 
     * Response format:
     * [
     * {"id": 1, "name": "Product A", "totalSold": 150, "revenue": 3000000},
     * ...
     * ]
     */
    @GetMapping("/top-products")
    public ResponseEntity<?> getTopProducts(
            @RequestParam(defaultValue = "5") int limit) {
        try {
            log.info("GET /api/dashboard/top-products - Limit: {}", limit);
            List<Map<String, Object>> topProducts = dashboardService.getTopProducts(limit);
            return ResponseEntity.ok(topProducts);
        } catch (Exception e) {
            log.error("Error in /api/dashboard/top-products", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Không thể tải sản phẩm bán chạy. Vui lòng thử lại sau."));
        }
    }

    /**
     * Get low stock products
     * 
     * Endpoint: GET /api/dashboard/low-stock?threshold=10
     * Auth: Admin only
     * 
     * Response format:
     * [
     * {"id": 1, "name": "Product A", "stock": 3, "price": 50000},
     * ...
     * ]
     */
    @GetMapping("/low-stock")
    public ResponseEntity<?> getLowStockProducts(
            @RequestParam(defaultValue = "10") int threshold) {
        try {
            log.info("GET /api/dashboard/low-stock - Threshold: {}", threshold);
            List<Map<String, Object>> lowStockProducts = dashboardService.getLowStockProductsDetailed(threshold);
            return ResponseEntity.ok(lowStockProducts);
        } catch (Exception e) {
            log.error("Error in /api/dashboard/low-stock", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Không thể tải sản phẩm sắp hết. Vui lòng thử lại sau."));
        }
    }

    /**
     * Helper method to create standardized error responses
     */
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        error.put("timestamp", java.time.LocalDateTime.now().toString());
        return error;
    }
}
