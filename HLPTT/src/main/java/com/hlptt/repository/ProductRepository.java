package com.hlptt.repository;

import com.hlptt.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {

       Page<Product> findByCategory_SlugIgnoreCase(String slug, Pageable pageable);

       Page<Product> findByIsFeaturedTrue(Pageable pageable);

       Page<Product> findBySalePriceNotNull(Pageable pageable);

       @Query("SELECT p FROM Product p WHERE " +
                     "(:keyword IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', : keyword, '%'))) AND " +
                     "(:categorySlug IS NULL OR p.category.slug = :categorySlug)")
       Page<Product> searchProducts(@Param("keyword") String keyword,
                     @Param("categorySlug") String categorySlug,
                     Pageable pageable);

       long countByCategory_CategoryId(Integer categoryId);

       // ==================== DASHBOARD STATISTICS QUERIES ====================

       /**
        * Get product count grouped by category
        * Used for: Products by category pie chart
        * Returns: List of [categoryName, productCount]
        */
       @Query("SELECT c.categoryName, COUNT(p) " +
                     "FROM Product p " +
                     "JOIN p.category c " +
                     "WHERE p.isActive = true " +
                     "GROUP BY c.categoryId, c.categoryName " +
                     "ORDER BY COUNT(p) DESC")
       List<Object[]> countProductsByCategory();

       /**
        * Count products with stock quantity less than threshold
        * Used for: Low stock alert count
        */
       long countByStockQuantityLessThan(int threshold);

       /**
        * Get products with low stock (for detailed view)
        * Used for: Low stock products list
        */
       @Query("SELECT p FROM Product p WHERE p.stockQuantity < :threshold ORDER BY p.stockQuantity ASC")
       List<Product> findLowStockProducts(@Param("threshold") int threshold);

       /**
        * Get top selling products with total sold and revenue
        * Used for: Top 5 products dashboard chart
        * Returns: [productId, productName, totalSold, revenue]
        */
       @Query("SELECT p.product.productId as id, p.product.productName as name, " +
                     "SUM(p.quantity) as totalSold, SUM(p.quantity * p.unitPrice) as revenue " +
                     "FROM OrderItem p " +
                     "WHERE p.order.createdAt >= :startDate " +
                     "AND p.order.status.statusName != :excludeStatus " +
                     "GROUP BY p.product.productId, p.product.productName " +
                     "ORDER BY SUM(p.quantity) DESC")
       List<Object[]> findTopSellingProducts(
                     @Param("startDate") java.time.LocalDateTime startDate,
                     @Param("excludeStatus") String excludeStatus,
                     Pageable pageable);
}