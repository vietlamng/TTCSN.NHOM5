package com.hlptt.repository;

import com.hlptt.entity.Coupon;
import com.hlptt.entity.CouponUsage;
import com.hlptt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponUsageRepository extends JpaRepository<CouponUsage, Integer> {
    // Đếm số lần một user cụ thể đã dùng một coupon cụ thể
    long countByCouponAndUser(Coupon coupon, User user);
}