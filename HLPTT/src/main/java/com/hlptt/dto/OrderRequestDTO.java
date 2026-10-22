package com.hlptt.dto;

import lombok.Data;
import java.util.List;

// Dùng @Data của Lombok sẽ tự động tạo Getter, Setter, 
// a required-args constructor, toString, và equals/hashCode.
@Data
public class OrderRequestDTO {

    // --- Thông tin giao hàng ---
    private String shippingFullName;
    private String shippingPhone;
    private String shippingEmail;
    private String shippingAddress;
    private String shippingCity;
    private String shippingDistrict;
    private String shippingWard;

    // --- Thông tin thanh toán ---
    private String paymentMethod; // Ví dụ: "cod", "vnpay"

    // --- Ghi chú ---
    private String note;

    private String couponCode;
    // private BigDecimal customShippingFee;

    private List<OrderItemDto> items;
}