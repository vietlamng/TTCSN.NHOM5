package com.hlptt.controller;

import com.hlptt.dto.BrandRequestDto;
import com.hlptt.entity.Brand;
import com.hlptt.exception.ResourceNotFoundException;
import com.hlptt.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    @Autowired
    private BrandRepository brandRepository;

    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        return ResponseEntity.ok(brandRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Brand> getBrandById(@PathVariable Integer id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thương hiệu với ID: " + id));
        return ResponseEntity.ok(brand);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Brand> createBrand(@RequestBody BrandRequestDto dto) {
        Brand brand = new Brand();
        brand.setBrandName(dto.getBrandName());
        brand.setSlug(dto.getSlug());
        brand.setDescription(dto.getDescription());
        brand.setLogo(dto.getLogo());
        brand.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        Brand savedBrand = brandRepository.save(brand);
        return ResponseEntity.status(201).body(savedBrand);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Brand> updateBrand(@PathVariable Integer id, @RequestBody BrandRequestDto dto) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thương hiệu với ID: " + id));

        brand.setBrandName(dto.getBrandName());
        brand.setSlug(dto.getSlug());
        brand.setDescription(dto.getDescription());
        brand.setLogo(dto.getLogo());
        brand.setIsActive(dto.getIsActive());

        Brand updatedBrand = brandRepository.save(brand);
        return ResponseEntity.ok(updatedBrand);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteBrand(@PathVariable Integer id) {
        if (!brandRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy thươngHIỆU với ID: " + id);
        }
        brandRepository.deleteById(id);
        return ResponseEntity.ok("Xóa thương hiệu thành công!");
    }
}