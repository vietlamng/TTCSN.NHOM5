package com.hlptt.service;

import com.hlptt.dto.DashboardStatsDto;
import com.hlptt.dto.DashboardStatsDto.StatItem;
import com.hlptt.entity.Product;
import com.hlptt.repository.OrderRepository;
import com.hlptt.repository.ProductRepository;
import com.hlptt.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;

/**
 * Service for Dashboard Statistics
 * All methods are read-only and safe for production use
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    // Only count COMPLETED orders for revenue/sales metrics
    private static final List<String> COMPLETED_STATUSES = List.of("Completed", "Delivered");
    private static final String CANCELLED_STATUS = "Cancelled";

    /**
     * Get overview statistics for dashboard
     * Includes: new orders, monthly revenue, new customers, products sold
     * 
     * @return DashboardStatsDto with all statistics
     */
    public DashboardStatsDto getDashboardStats() {
        try {
            log.info("Fetching dashboard statistics");

            DashboardStatsDto stats = new DashboardStatsDto();

            // Calculate date ranges
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startOfWeek = LocalDate.now().atStartOfDay().minusDays(7);
            LocalDateTime previousWeekStart = startOfWeek.minusDays(7);
            LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
            LocalDateTime previousMonthStart = startOfMonth.minusMonths(1);

            // 1. New Orders (this week vs last week)
            stats.setNewOrders(calculateNewOrders(startOfWeek, previousWeekStart));

            // 2. Monthly Revenue (this month vs last month)
            stats.setMonthRevenue(calculateMonthlyRevenue(startOfMonth, previousMonthStart));

            // 3. New Customers (this week vs last week)
            stats.setNewCustomers(calculateNewCustomers(startOfWeek, previousWeekStart));

            // 4. Products Sold (this week)
            stats.setProductsSold(calculateProductsSold(startOfWeek));

            // 5. Cancellation Rate (this week)
            stats.setCancellationRate(calculateCancellationRate(startOfWeek));

            // 6. Pending Orders (current count)
            stats.setPendingOrders(calculatePendingOrders());

            // 7. Average Order Value (this month)
            stats.setAverageOrderValue(calculateAverageOrderValue(startOfMonth));

            // 8. Low Stock Products (count)
            stats.setLowStockProducts(calculateLowStockProducts());

            log.info("Dashboard statistics fetched successfully");
            return stats;

        } catch (Exception e) {
            log.error("Error fetching dashboard statistics", e);
            // Return empty stats instead of throwing exception
            return createEmptyStats();
        }
    }

    /**
     * Calculate new orders statistics
     */
    private StatItem calculateNewOrders(LocalDateTime startOfWeek, LocalDateTime previousWeekStart) {
        try {
            long currentWeekOrders = orderRepository.countByCreatedAtAfter(startOfWeek);
            long previousWeekOrders = orderRepository.countByCreatedAtBetween(previousWeekStart, startOfWeek);

            double changePercent = calculatePercentageChange(previousWeekOrders, currentWeekOrders);

            log.debug("New orders - Current: {}, Previous: {}, Change: {}%",
                    currentWeekOrders, previousWeekOrders, changePercent);

            return new StatItem(currentWeekOrders, changePercent);

        } catch (Exception e) {
            log.error("Error calculating new orders", e);
            return new StatItem(0L, 0.0);
        }
    }

    /**
     * Calculate monthly revenue statistics
     */
    private StatItem calculateMonthlyRevenue(LocalDateTime startOfMonth, LocalDateTime previousMonthStart) {
        try {
            BigDecimal currentMonthRevenue = orderRepository
                    .sumTotalAmountByCreatedAtAfterAndStatusNotName(startOfMonth, CANCELLED_STATUS);

            BigDecimal previousMonthRevenue = orderRepository
                    .sumTotalAmountByCreatedAtBetweenAndStatusNotName(
                            previousMonthStart, startOfMonth, CANCELLED_STATUS);

            // Handle null values (COALESCE in query should prevent this, but double-check)
            currentMonthRevenue = currentMonthRevenue != null ? currentMonthRevenue : BigDecimal.ZERO;
            previousMonthRevenue = previousMonthRevenue != null ? previousMonthRevenue : BigDecimal.ZERO;

            double changePercent = calculatePercentageChange(
                    previousMonthRevenue.doubleValue(),
                    currentMonthRevenue.doubleValue());

            log.debug("Monthly revenue - Current: {}, Previous: {}, Change: {}%",
                    currentMonthRevenue, previousMonthRevenue, changePercent);

            return new StatItem(currentMonthRevenue, changePercent);

        } catch (Exception e) {
            log.error("Error calculating monthly revenue", e);
            return new StatItem(BigDecimal.ZERO, 0.0);
        }
    }

    /**
     * Calculate new customers statistics
     */
    private StatItem calculateNewCustomers(LocalDateTime startOfWeek, LocalDateTime previousWeekStart) {
        try {
            long currentWeekCustomers = userRepository.countByCreatedAtAfter(startOfWeek);
            long previousWeekCustomers = userRepository.countByCreatedAtBetween(previousWeekStart, startOfWeek);

            double changePercent = calculatePercentageChange(previousWeekCustomers, currentWeekCustomers);

            log.debug("New customers - Current: {}, Previous: {}, Change: {}%",
                    currentWeekCustomers, previousWeekCustomers, changePercent);

            return new StatItem(currentWeekCustomers, changePercent);

        } catch (Exception e) {
            log.error("Error calculating new customers", e);
            return new StatItem(0L, 0.0);
        }
    }

    /**
     * Calculate products sold statistics
     */
    private StatItem calculateProductsSold(LocalDateTime startOfWeek) {
        try {
            // Only count products from COMPLETED orders
            Long productsSold = orderRepository.countTotalProductsSoldAfterByStatusIn(
                    startOfWeek, COMPLETED_STATUSES);
            productsSold = productsSold != null ? productsSold : 0L;

            log.debug("Products sold this week: {}", productsSold);

            // No comparison for products sold (just current count)
            return new StatItem(productsSold, 0.0);

        } catch (Exception e) {
            log.error("Error calculating products sold", e);
            return new StatItem(0L, 0.0);
        }
    }

    /**
     * Get revenue data for the last 12 months
     * 
     * @param year Target year (if null, uses current year)
     * @return Map with labels and data arrays
     */
    public Map<String, Object> getRevenueByMonth(Integer year) {
        try {
            if (year == null) {
                year = LocalDate.now().getYear();
            }

            log.info("Fetching revenue by month for year: {}", year);

            List<Object[]> revenueData = orderRepository.sumRevenueByMonth(year, CANCELLED_STATUS);

            // Prepare result with all 12 months (even if some have 0 revenue)
            List<String> labels = Arrays.asList("T1", "T2", "T3", "T4", "T5", "T6",
                    "T7", "T8", "T9", "T10", "T11", "T12");
            List<Double> data = new ArrayList<>();

            // Initialize all months with 0
            Map<Integer, Double> revenueMap = new HashMap<>();
            for (int i = 1; i <= 12; i++) {
                revenueMap.put(i, 0.0);
            }

            // Fill in actual revenue data
            for (Object[] row : revenueData) {
                Integer month = (Integer) row[0];
                BigDecimal revenue = (BigDecimal) row[1];
                // Convert to millions (VND)
                double revenueInMillions = revenue.divide(new BigDecimal("1000000"), 2, RoundingMode.HALF_UP)
                        .doubleValue();
                revenueMap.put(month, revenueInMillions);
            }

            // Add data in order (months 1-12)
            for (int i = 1; i <= 12; i++) {
                data.add(revenueMap.get(i));
            }

            Map<String, Object> result = new HashMap<>();
            result.put("labels", labels);
            result.put("data", data);
            result.put("year", year);

            log.info("Revenue by month fetched successfully");
            return result;

        } catch (Exception e) {
            log.error("Error fetching revenue by month", e);
            return createEmptyChartData();
        }
    }

    /**
     * Get product distribution by category
     * 
     * @return Map with category labels and product counts
     */
    public Map<String, Object> getProductsByCategory() {
        try {
            log.info("Fetching products by category");

            List<Object[]> categoryData = productRepository.countProductsByCategory();

            List<String> labels = new ArrayList<>();
            List<Long> data = new ArrayList<>();

            // Calculate total for percentage calculation
            long totalProducts = categoryData.stream()
                    .mapToLong(row -> (Long) row[1])
                    .sum();

            for (Object[] row : categoryData) {
                String categoryName = (String) row[0];
                Long count = (Long) row[1];

                labels.add(categoryName);
                data.add(count);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("labels", labels);
            result.put("data", data);
            result.put("totalProducts", totalProducts);

            log.info("Products by category fetched successfully. Categories: {}", labels.size());
            return result;

        } catch (Exception e) {
            log.error("Error fetching products by category", e);
            return createEmptyChartData();
        }
    }

    /**
     * Get order counts for the last 30 days
     * 
     * @return Map with date labels and order counts
     */
    public Map<String, Object> getOrdersLast30Days() {
        try {
            log.info("Fetching orders for last 30 days");

            LocalDateTime startDate = LocalDate.now().minusDays(29).atStartOfDay();
            List<Object[]> orderData = orderRepository.countOrdersByDay(startDate);

            // Create a map of all dates in the last 30 days
            Map<LocalDate, Long> orderMap = new HashMap<>();
            LocalDate today = LocalDate.now();
            for (int i = 29; i >= 0; i--) {
                orderMap.put(today.minusDays(i), 0L);
            }

            // Fill in actual order counts
            for (Object[] row : orderData) {
                LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
                Long count = (Long) row[1];
                orderMap.put(date, count);
            }

            // Build result lists in chronological order
            List<String> labels = new ArrayList<>();
            List<Long> data = new ArrayList<>();

            for (int i = 29; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                labels.add("Ngày " + date.getDayOfMonth());
                data.add(orderMap.get(date));
            }

            Map<String, Object> result = new HashMap<>();
            result.put("labels", labels);
            result.put("data", data);

            log.info("Orders for last 30 days fetched successfully");
            return result;

        } catch (Exception e) {
            log.error("Error fetching orders for last 30 days", e);
            return createEmptyChartData();
        }
    }

    // ==================== HELPER METHODS ====================

    // ==================== NEW STATISTICS METHODS ====================

    /**
     * Calculate cancellation rate (percentage of cancelled orders)
     */
    private StatItem calculateCancellationRate(LocalDateTime startOfWeek) {
        try {
            long totalOrders = orderRepository.countByCreatedAtAfter(startOfWeek);
            long cancelledOrders = orderRepository.countByCreatedAtAfterAndStatus_StatusName(
                    startOfWeek, CANCELLED_STATUS);

            double cancellationRate = totalOrders > 0
                    ? (cancelledOrders * 100.0 / totalOrders)
                    : 0.0;

            // Round to 1 decimal place
            cancellationRate = Math.round(cancellationRate * 10.0) / 10.0;

            log.debug("Cancellation rate - Total: {}, Cancelled: {}, Rate: {}%",
                    totalOrders, cancelledOrders, cancellationRate);

            // Return rate as "count" for display (percentage value)
            return new StatItem((long) cancellationRate, 0.0);

        } catch (Exception e) {
            log.error("Error calculating cancellation rate", e);
            return new StatItem(0L, 0.0);
        }
    }

    /**
     * Calculate pending orders count
     */
    private StatItem calculatePendingOrders() {
        try {
            // Count orders with status "Pending" or "Processing"
            long pendingCount = orderRepository.countByStatus_StatusNameIn(
                    List.of("Pending", "Processing", "Confirmed"));

            log.debug("Pending orders count: {}", pendingCount);

            return new StatItem(pendingCount, 0.0);

        } catch (Exception e) {
            log.error("Error calculating pending orders", e);
            return new StatItem(0L, 0.0);
        }
    }

    /**
     * Calculate average order value (AOV) for current month
     */
    private StatItem calculateAverageOrderValue(LocalDateTime startOfMonth) {
        try {
            BigDecimal totalRevenue = orderRepository
                    .sumTotalAmountByCreatedAtAfterAndStatusNotName(startOfMonth, CANCELLED_STATUS);

            long orderCount = orderRepository.countByCreatedAtAfter(startOfMonth);

            BigDecimal aov = BigDecimal.ZERO;
            if (orderCount > 0 && totalRevenue != null) {
                aov = totalRevenue.divide(new BigDecimal(orderCount), 0, RoundingMode.HALF_UP);
            }

            log.debug("AOV - Revenue: {}, Orders: {}, AOV: {}", totalRevenue, orderCount, aov);

            return new StatItem(aov, 0.0);

        } catch (Exception e) {
            log.error("Error calculating average order value", e);
            return new StatItem(BigDecimal.ZERO, 0.0);
        }
    }

    /**
     * Calculate low stock products count (stock < 10)
     */
    private StatItem calculateLowStockProducts() {
        try {
            long lowStockCount = productRepository.countByStockQuantityLessThan(10);

            log.debug("Low stock products count: {}", lowStockCount);

            return new StatItem(lowStockCount, 0.0);

        } catch (Exception e) {
            log.error("Error calculating low stock products", e);
            return new StatItem(0L, 0.0);
        }
    }

    /**
     * Get top selling products (for detailed view)
     */
    public List<Map<String, Object>> getTopProducts(int limit) {
        try {
            LocalDateTime startDate = LocalDate.now().minusDays(30).atStartOfDay();
            Pageable pageable = PageRequest.of(0, limit);

            List<Object[]> topProducts = productRepository.findTopSellingProducts(
                    startDate, CANCELLED_STATUS, pageable);

            List<Map<String, Object>> result = new ArrayList<>();
            for (Object[] row : topProducts) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", row[0]);
                item.put("name", row[1]);
                item.put("totalSold", row[2]);
                item.put("revenue", row[3]);
                result.add(item);
            }

            return result;

        } catch (Exception e) {
            log.error("Error fetching top products", e);
            return new ArrayList<>();
        }
    }

    /**
     * Get low stock products (for detailed view)
     */
    public List<Map<String, Object>> getLowStockProductsDetailed(int threshold) {
        try {
            List<Product> lowStockProducts = productRepository.findLowStockProducts(threshold);

            List<Map<String, Object>> result = new ArrayList<>();
            for (Product product : lowStockProducts) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", product.getProductId());
                item.put("name", product.getProductName());
                item.put("stock", product.getStockQuantity());
                item.put("price", product.getPrice());
                result.add(item);
            }

            return result;

        } catch (Exception e) {
            log.error("Error fetching low stock products", e);
            return new ArrayList<>();
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Calculate percentage change between two values
     * Handles division by zero safely
     */
    private double calculatePercentageChange(double oldValue, double newValue) {
        if (oldValue == 0) {
            return newValue > 0 ? 100.0 : 0.0;
        }
        double change = ((newValue - oldValue) / oldValue) * 100;
        return Math.round(change * 10.0) / 10.0; // Round to 1 decimal place
    }

    /**
     * Create empty statistics (fallback for errors)
     */
    private DashboardStatsDto createEmptyStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setNewOrders(new StatItem(0L, 0.0));
        stats.setMonthRevenue(new StatItem(BigDecimal.ZERO, 0.0));
        stats.setNewCustomers(new StatItem(0L, 0.0));
        stats.setProductsSold(new StatItem(0L, 0.0));
        stats.setCancellationRate(new StatItem(0L, 0.0));
        stats.setPendingOrders(new StatItem(0L, 0.0));
        stats.setAverageOrderValue(new StatItem(BigDecimal.ZERO, 0.0));
        stats.setLowStockProducts(new StatItem(0L, 0.0));
        return stats;
    }

    /**
     * Create empty chart data (fallback for errors)
     */
    private Map<String, Object> createEmptyChartData() {
        Map<String, Object> result = new HashMap<>();
        result.put("labels", new ArrayList<>());
        result.put("data", new ArrayList<>());
        return result;
    }
}
