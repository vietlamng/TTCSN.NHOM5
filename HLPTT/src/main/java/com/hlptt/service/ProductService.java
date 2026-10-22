package com.hlptt.service;

import com.hlptt.dto.ProductRequestDto;
import com.hlptt.entity.Brand;
import com.hlptt.entity.Category;
import com.hlptt.entity.Product;
import com.hlptt.exception.ResourceNotFoundException;
import com.hlptt.repository.BrandRepository;
import com.hlptt.repository.CategoryRepository;
import com.hlptt.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private BrandRepository brandRepository;

    // === HÀM LẤY SẢN PHẨM (Được gọi từ Controller) ===
    public Page<Product> getProducts(Pageable pageable, String categorySlug, String keyword) {
        // Nếu không có keyword và không có category -> Lấy tất cả
        if (!StringUtils.hasText(keyword) && !StringUtils.hasText(categorySlug)) {
            return productRepository.findAll(pageable);
        }
        
        // Nếu có keyword hoặc category -> Gọi hàm tìm kiếm tùy biến
        // Xử lý null cho chắc chắn để truyền vào Query không bị lỗi
        String key = StringUtils.hasText(keyword) ? keyword.trim() : null;
        String slug = StringUtils.hasText(categorySlug) ? categorySlug.trim() : null;
        
        return productRepository.searchProducts(key, slug, pageable);
    }

    public Page<Product> getFeaturedProducts(Pageable pageable) {
        return productRepository.findByIsFeaturedTrue(pageable);
    }

    public Page<Product> getFlashSaleProducts(Pageable pageable) {
        return productRepository.findBySalePriceNotNull(pageable);
    }

    public Product getProductById(Integer id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id));
    }

    public Product createProduct(ProductRequestDto dto) {
        Product product = new Product();
        mapDtoToEntity(dto, product);
        return productRepository.save(product);
    }

    public Product updateProduct(Integer id, ProductRequestDto dto) {
        Product product = getProductById(id);
        mapDtoToEntity(dto, product);
        return productRepository.save(product);
    }

    public void deleteProduct(Integer id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + id);
        }
        productRepository.deleteById(id);
    }

    private void mapDtoToEntity(ProductRequestDto dto, Product product) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Category ID: " + dto.getCategoryId()));

        Brand brand = (dto.getBrandId() != null) ? brandRepository.findById(dto.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Brand ID: " + dto.getBrandId()))
                : null;

        product.setProductName(dto.getProductName());
        product.setSlug(dto.getSlug());
        product.setSku(dto.getSku());
        product.setDescription(dto.getDescription());
        product.setShortDescription(dto.getShortDescription());
        product.setPrice(dto.getPrice());
        product.setSalePrice(dto.getSalePrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setUnit(dto.getUnit());
        product.setWeight(dto.getWeight());
        product.setIsOrganic(dto.getIsOrganic());
        product.setIsFeatured(dto.getIsFeatured());
        product.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        product.setCategory(category);
        product.setBrand(brand);
    }
}