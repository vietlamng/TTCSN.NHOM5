package com.hlptt.service;

import com.hlptt.entity.Coupon;
import com.hlptt.entity.Order;
import com.hlptt.entity.User;
import java.math.BigDecimal;
import java.util.List;

public interface CouponService {

    List<Coupon> getAllCoupons();
    Coupon saveCoupon(Coupon coupon);
    void deleteCoupon(Integer id);
    
    Coupon getCouponByCode(String code);

    BigDecimal calculateDiscount(String couponCode, BigDecimal totalOrderValue);

    void markCouponAsUsed(String couponCode, User user, Order order, BigDecimal discountAmount);
}