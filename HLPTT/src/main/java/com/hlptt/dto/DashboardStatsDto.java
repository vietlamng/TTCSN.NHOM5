package com.hlptt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for Dashboard Statistics Response
 * Used to safely transfer dashboard data from service to controller
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {

    // New Orders Section
    private StatItem newOrders;

    // Monthly Revenue Section
    private StatItem monthRevenue;

    // New Customers Section
    private StatItem newCustomers;

    // Products Sold Section
    private StatItem productsSold;

    // Cancellation Rate Section (NEW)
    private StatItem cancellationRate;

    // Pending Orders Section (NEW)
    private StatItem pendingOrders;

    // Average Order Value Section (NEW)
    private StatItem averageOrderValue;

    // Low Stock Products Count (NEW)
    private StatItem lowStockProducts;

    /**
     * Inner class for individual stat items
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatItem {
        private Long count; // For order count, customer count, product count
        private BigDecimal amount; // For revenue amount
        private Double change; // Percentage change vs previous period

        // Constructor for count-based stats
        public StatItem(Long count, Double change) {
            this.count = count;
            this.change = change;
        }

        // Constructor for amount-based stats
        public StatItem(BigDecimal amount, Double change) {
            this.amount = amount;
            this.change = change;
        }
    }
}
