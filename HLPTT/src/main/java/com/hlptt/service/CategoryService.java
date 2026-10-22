package com.hlptt.service;

import com.hlptt.dto.CategoryRequestDto;
import com.hlptt.entity.Category;
import com.hlptt.exception.ResourceNotFoundException;
import com.hlptt.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // Lấy danh sách (có tìm kiếm)
    public Page<Category> getCategories(String keyword, Pageable pageable) {
        return categoryRepository.searchCategories(keyword, pageable);
    }

    // Lấy tất cả (cho dropdown)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục ID: " + id));
    }

    public Category createCategory(CategoryRequestDto dto) {
        Category category = new Category();
        mapDtoToEntity(dto, category);

        // Tự tạo slug nếu chưa có
        if (!StringUtils.hasText(category.getSlug())) {
            category.setSlug(dto.getCategoryName().toLowerCase().replace(" ", "-") + "-" + System.currentTimeMillis());
        }

        return categoryRepository.save(category);
    }

    public Category updateCategory(Integer id, CategoryRequestDto dto) {
        Category category = getCategoryById(id);
        mapDtoToEntity(dto, category);
        return categoryRepository.save(category);
    }

    public void deleteCategory(Integer id) {
        if (!categoryRepository.existsById(id))
            throw new ResourceNotFoundException("Không tìm thấy danh mục");
        try {
            categoryRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Không thể xóa danh mục này (có thể đang chứa sản phẩm)");
        }
    }

    private void mapDtoToEntity(CategoryRequestDto dto, Category category) {
        category.setCategoryName(dto.getCategoryName());
        if (StringUtils.hasText(dto.getSlug())) {
            category.setSlug(dto.getSlug());
        }
        category.setDescription(dto.getDescription());
        category.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        category.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);

        if (dto.getParentId() != null) {
            Category parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy parentId: " + dto.getParentId()));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }
    }

    public void updateCategoryImage(Integer id, String imageUrl) {
        Category category = getCategoryById(id);
        category.setImage(imageUrl);
        categoryRepository.save(category);
    }
}