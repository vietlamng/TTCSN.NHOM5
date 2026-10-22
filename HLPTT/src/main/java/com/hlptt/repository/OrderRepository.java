package com.hlptt.repository;

import com.hlptt.entity.Order;
import com.hlptt.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Integer> {

       // 1. Tìm theo mã đơn hàng (Dùng cho API get detail)
       Optional<Order> findByOrderCode(String orderCode);

       // 2. Lấy danh sách đơn của 1 User (Dùng cho Client)
       Page<Order> findByUser(User user, Pageable pageable);

       // 2b. Lấy danh sách đơn của 1 User theo Status
       Page<Order> findByUserAndStatus_StatusName(User user, String statusName, Pageable pageable);

       // 3. Tìm kiếm tổng hợp (Dùng cho Admin: search + filter + pagination)
       @Query("SELECT o FROM Order o WHERE " +
                     "(:keyword IS NULL OR :keyword = '' OR " +
                     "LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(o.shippingFullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(o.shippingPhone) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                     "AND (:status IS NULL OR :status = '' OR :status = 'ALL' OR o.status.statusName = :status)")
       Page<Order> searchOrders(@Param("keyword") String keyword, @Param("status") String status, Pageable pageable);

       // ==================== DASHBOARD STATISTICS QUERIES ====================

       long countByCreatedAtAfter(LocalDateTime date);

       long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

       @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
                     "WHERE o.createdAt >= :date " +
                     "AND o.status.statusName != :excludeStatus")
       BigDecimal sumTotalAmountByCreatedAtAfterAndStatusNotName(
                     @Param("date") LocalDateTime date,
                     @Param("excludeStatus") String excludeStatus);

       @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
                     "WHERE o.createdAt BETWEEN :start AND :end " +
                     "AND o.status.statusName != :excludeStatus")
       BigDecimal sumTotalAmountByCreatedAtBetweenAndStatusNotName(
                     @Param("start") LocalDateTime start,
                     @Param("end") LocalDateTime end,
                     @Param("excludeStatus") String excludeStatus);

       @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi " +
                     "WHERE oi.order.createdAt >= :date " +
                     "AND oi.order.status.statusName != :excludeStatus")
       Long countTotalProductsSoldAfter(
                     @Param("date") LocalDateTime date,
                     @Param("excludeStatus") String excludeStatus);

       @Query("SELECT DATE(o.createdAt) as orderDate, COUNT(o) as orderCount " +
                     "FROM Order o " +
                     "WHERE o.createdAt >= :startDate " +
                     "GROUP BY DATE(o.createdAt) " +
                     "ORDER BY DATE(o.createdAt)")
       List<Object[]> countOrdersByDay(@Param("startDate") LocalDateTime startDate);

       @Query("SELECT MONTH(o.createdAt) as month, COALESCE(SUM(o.totalAmount), 0) as revenue " +
                     "FROM Order o " +
                     "WHERE YEAR(o.createdAt) = :year " +
                     "AND o.status.statusName != :excludeStatus " +
                     "GROUP BY MONTH(o.createdAt) " +
                     "ORDER BY MONTH(o.createdAt)")
       List<Object[]> sumRevenueByMonth(
                     @Param("year") int year,
                     @Param("excludeStatus") String excludeStatus);

       long countByCreatedAtAfterAndStatus_StatusName(
                     LocalDateTime date,
                     String statusName);

       long countByStatus_StatusNameIn(List<String> statusNames);

       // NEW: Query only COMPLETED orders (Completed/Delivered)
       @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
                     "WHERE o.createdAt >= :date " +
                     "AND o.status.statusName IN :statuses")
       BigDecimal sumTotalAmountByCreatedAtAfterAndStatusIn(
                     @Param("date") LocalDateTime date,
                     @Param("statuses") List<String> statuses);

       @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
                     "WHERE o.createdAt BETWEEN :start AND :end " +
                     "AND o.status.statusName IN :statuses")
       BigDecimal sumTotalAmountByCreatedAtBetweenAndStatusIn(
                     @Param("start") LocalDateTime start,
                     @Param("end") LocalDateTime end,
                     @Param("statuses") List<String> statuses);

       @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi " +
                     "WHERE oi.order.createdAt >= :date " +
                     "AND oi.order.status.statusName IN :statuses")
       Long countTotalProductsSoldAfterByStatusIn(
                     @Param("date") LocalDateTime date,
                     @Param("statuses") List<String> statuses);
}
