package com.joyeria.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private Long totalProducts;
    private Long totalUsers;
    private Long totalCustomers;
    private Long pendingOrders;
    private Long lowStockProducts;
    private Long outOfStockProducts;
    private List<Map<String, Object>> topSellingProducts;
    private List<Map<String, Object>> recentOrders;
    private Map<String, Long> ordersByStatus;
}
