package com.hlptt.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CouponValidationDto {
    private String couponCode;
    private BigDecimal totalAmount;
}
