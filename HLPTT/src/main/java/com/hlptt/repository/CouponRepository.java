package com.hlptt.repository;

import com.hlptt.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Integer> {

    Optional<Coupon> findByCouponCode(String couponCode);

    Optional<Coupon> findByCouponCodeIgnoreCase(String couponCode);

    boolean existsByCouponCode(String couponCode);
}