package com.hlptt.dto;

import lombok.Data;

@Data
public class ReviewRequestDTO {
    private Integer productId;
    private Integer orderId; // Bắt buộc phải gửi kèm orderId để chứng minh đã mua
    private Integer rating; // 1-5
    private String title;
    private String comment;
}