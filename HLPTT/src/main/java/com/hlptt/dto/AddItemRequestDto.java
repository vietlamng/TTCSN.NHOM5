package com.hlptt.dto;

import lombok.Data;

@Data
public class AddItemRequestDto {
    private Integer productId;
    private Integer quantity;
}