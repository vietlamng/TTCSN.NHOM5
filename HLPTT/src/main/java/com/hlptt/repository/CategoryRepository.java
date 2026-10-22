package com.hlptt.repository;

import com.hlptt.dto.CategorySummaryDto;
import com.hlptt.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Integer> {

    @Query("""
            SELECT new com.hlptt.dto.CategorySummaryDto(
                c.categoryId,
                c.categoryName,
                c.slug,
                c.image,
                COUNT(p),
                c.displayOrder
            )
            FROM Category c
            LEFT JOIN c.products p WITH p.isActive = true
            WHERE c.parent IS NULL AND c.isActive = true
            GROUP BY c.categoryId, c.categoryName, c.slug, c.image, c.displayOrder
            ORDER BY c.displayOrder ASC, c.categoryName ASC
            """)
    List<CategorySummaryDto> findTopLevelSummaries();

    boolean existsBySlug(String slug);

    // Tìm kiếm theo tên
    @Query("SELECT c FROM Category c WHERE " +
           "(:keyword IS NULL OR LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Category> searchCategories(@Param("keyword") String keyword, Pageable pageable);
}