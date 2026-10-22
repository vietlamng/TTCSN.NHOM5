package com.hlptt.controller;

import com.hlptt.dto.CategoryRequestDto;
import com.hlptt.dto.CategorySummaryDto;
import com.hlptt.entity.Category;
import com.hlptt.service.CategoryService;
import com.hlptt.service.CloudinaryService;
import com.hlptt.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;
    @Autowired
    private CloudinaryService cloudinaryService;
    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<?> getAll(
            Pageable pageable,
            @RequestParam(required = false) String keyword) {
        Page<Category> categories = categoryService.getCategories(keyword, pageable);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getListAll() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/highlights")
    public ResponseEntity<List<CategorySummaryDto>> getHighlightCategories() {
        int limit = 12;
        PageRequest pageable = PageRequest.of(0, limit, Sort.by("displayOrder").ascending());

        Page<Category> page = categoryService.getCategories(null, pageable);

        List<CategorySummaryDto> dtos = page.getContent().stream().map(cat -> {

            // --- SỬA DÒNG NÀY (Thêm dấu gạch dưới cho khớp với Repository) ---
            long count = productRepository.countByCategory_CategoryId(cat.getCategoryId());
            // ------------------------------------------------------------------

            return new CategorySummaryDto(
                    cat.getCategoryId(),
                    cat.getCategoryName(),
                    cat.getSlug(),
                    cat.getImage(),
                    count,
                    cat.getDisplayOrder());
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Category> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> create(@RequestBody CategoryRequestDto dto) {
        return ResponseEntity.status(201).body(categoryService.createCategory(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> update(@PathVariable Integer id, @RequestBody CategoryRequestDto dto) {
        return ResponseEntity.ok(categoryService.updateCategory(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok("Xóa thành công");
    }

    @PostMapping("/{id}/upload-image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadImage(@PathVariable Integer id, @RequestParam("file") MultipartFile file) {
        String url = cloudinaryService.uploadFile(file);
        categoryService.updateCategoryImage(id, url);
        return ResponseEntity.ok(Map.of("message", "Upload thành công", "url", url));
    }
}