package com.hlptt.service.impl;

import com.hlptt.entity.Coupon;
import com.hlptt.entity.CouponUsage;
import com.hlptt.entity.Order;
import com.hlptt.entity.User;
import com.hlptt.exception.BadRequestException;
import com.hlptt.exception.ResourceNotFoundException;
import com.hlptt.repository.CouponRepository;
import com.hlptt.repository.CouponUsageRepository;
import com.hlptt.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CouponServiceImpl implements CouponService {

    @Autowired
    private CouponRepository couponRepository;
    
    @Autowired
    private CouponUsageRepository couponUsageRepository;

    // === ADMIN METHODS ===

    @Override
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll(Sort.by(Sort.Direction.DESC, "couponId"));
    }

    @Override
    public Coupon saveCoupon(Coupon coupon) {
        // Nếu là thêm mới (không có ID), check trùng code
        if (coupon.getCouponId() == null) {
            if (couponRepository.existsByCouponCode(coupon.getCouponCode())) {
                throw new BadRequestException("Mã giảm giá '" + coupon.getCouponCode() + "' đã tồn tại!");
            }
        }
        return couponRepository.save(coupon);
    }

    @Override
    public void deleteCoupon(Integer id) {
        if(!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy mã giảm giá ID: " + id);
        }
        couponRepository.deleteById(id);
    }

    // === CLIENT METHODS ===

    @Override
    public Coupon getCouponByCode(String code) {
        return couponRepository.findByCouponCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại: " + code));
    }

    @Override
    public BigDecimal calculateDiscount(String couponCode, BigDecimal totalOrderValue) {
        if (couponCode == null || couponCode.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }

        Coupon coupon = getCouponByCode(couponCode);

        if (Boolean.FALSE.equals(coupon.getIsActive())) { 
            throw new BadRequestException("Mã giảm giá này đã bị khóa.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new BadRequestException("Mã giảm giá chưa đến đợt áp dụng.");
        }
        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) {
            throw new BadRequestException("Mã giảm giá đã hết hạn.");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Mã giảm giá đã hết lượt sử dụng.");
        }

        BigDecimal minOrder = coupon.getMinOrderValue() != null ? coupon.getMinOrderValue() : BigDecimal.ZERO;
        if (totalOrderValue.compareTo(minOrder) < 0) {
            throw new BadRequestException("Đơn hàng chưa đủ giá trị tối thiểu ("
                    + minOrder + " đ) để dùng mã này.");
        }

        BigDecimal discountAmount = BigDecimal.ZERO;

        if ("percentage".equalsIgnoreCase(coupon.getDiscountType())) {
            discountAmount = totalOrderValue.multiply(coupon.getDiscountValue())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

            if (coupon.getMaxDiscountAmount() != null
                    && discountAmount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discountAmount = coupon.getMaxDiscountAmount();
            }
        } else { 
            discountAmount = coupon.getDiscountValue();
        }

        if (discountAmount.compareTo(totalOrderValue) > 0) {
            discountAmount = totalOrderValue;
        }

        return discountAmount;
    }

    @Override
    @Transactional
    public void markCouponAsUsed(String couponCode, User user, Order order, BigDecimal discountAmount) {
        if (couponCode == null || couponCode.trim().isEmpty()) return;

        Coupon coupon = getCouponByCode(couponCode);

        // Tăng số lần sử dụng
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        CouponUsage usage = new CouponUsage();
        usage.setCoupon(coupon);
        usage.setUser(user);
        usage.setOrder(order);
        usage.setDiscountAmount(discountAmount);
        usage.setUsedAt(LocalDateTime.now());

        couponUsageRepository.save(usage);
    }
}