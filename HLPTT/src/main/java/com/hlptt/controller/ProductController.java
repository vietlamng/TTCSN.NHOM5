package com.hlptt.controller;

import com.hlptt.dto.ProductRequestDto;
import com.hlptt.entity.Product;
import com.hlptt.entity.ProductImage;
import com.hlptt.repository.ProductImageRepository;
import com.hlptt.service.CloudinaryService;
import com.hlptt.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private CloudinaryService cloudinaryService;
    @Autowired
    private ProductImageRepository productImageRepository;
    @Autowired
    private ProductService productService;

    // === HÀM LẤY DANH SÁCH DUY NHẤT (Hỗ trợ: Phân trang, Lọc danh mục, Tìm kiếm) ===
    @GetMapping
    public ResponseEntity<Page<Product>> getAllProducts(
            Pageable pageable,
            @RequestParam(value = "category", required = false) String categorySlug,
            @RequestParam(value = "keyword", required = false) String keyword
    ) {
        // Gọi service xử lý
        Page<Product> products = productService.getProducts(pageable, categorySlug, keyword);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/featured")
    public ResponseEntity<Page<Product>> getFeaturedProducts(Pageable pageable) {
        Page<Product> products = productService.getFeaturedProducts(pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/flash-sale")
    public ResponseEntity<Page<Product>> getFlashSaleProducts(Pageable pageable) {
        Page<Product> products = productService.getFlashSaleProducts(pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Integer id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> createProduct(@RequestBody ProductRequestDto dto) {
        Product newProduct = productService.createProduct(dto);
        return ResponseEntity.status(201).body(newProduct);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> updateProduct(@PathVariable Integer id, @RequestBody ProductRequestDto dto) {
        Product updatedProduct = productService.updateProduct(id, dto);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Xóa sản phẩm thành công!");
    }

    @PostMapping("/{productId}/upload-image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadProductImage(
            @PathVariable Integer productId,
            @RequestParam("file") MultipartFile file) {

        Product product = productService.getProductById(productId);
        String imageUrl = cloudinaryService.uploadFile(file);

        ProductImage productImage = new ProductImage();
        productImage.setImageUrl(imageUrl);
        productImage.setProduct(product);

        productImageRepository.save(productImage);

        return ResponseEntity.ok(Map.of("message", "Upload ảnh thành công!", "url", imageUrl));
    }
}