package com.hlptt.controller;

import com.hlptt.dto.CouponValidationDto;
import com.hlptt.entity.Coupon;
import com.hlptt.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    // ==================== ADMIN API ====================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Coupon>> getAll() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponService.saveCoupon(coupon));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Coupon coupon) {
        coupon.setCouponId(id);
        return ResponseEntity.ok(couponService.saveCoupon(coupon));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok("Xóa thành công");
    }

    // ==================== CLIENT API ====================

    /**
     * API kiểm tra và tính toán giảm giá
     * POST /api/coupons/validate
     * Body: { "couponCode": "SALE50", "totalAmount": 500000 }
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validateCoupon(@RequestBody CouponValidationDto request) {
        try {
            BigDecimal discountAmount = couponService.calculateDiscount(request.getCouponCode(), request.getTotalAmount());
            
            BigDecimal finalAmount = request.getTotalAmount().subtract(discountAmount);
            if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
                finalAmount = BigDecimal.ZERO;
            }

            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("discountAmount", discountAmount);
            response.put("finalAmount", finalAmount);
            response.put("message", "Áp dụng mã giảm giá thành công!");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("valid", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}