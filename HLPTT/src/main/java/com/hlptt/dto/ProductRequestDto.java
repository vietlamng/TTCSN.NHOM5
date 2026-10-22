package com.hlptt.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequestDto {
    private String productName;
    private String slug;
    private String sku;
    private String description;
    private String shortDescription;

    private Integer categoryId;
    private Integer brandId;

    private BigDecimal price;
    private BigDecimal salePrice;

    private Integer stockQuantity;
    private String unit;
    private BigDecimal weight;

    private Boolean isOrganic;
    private Boolean isFeatured;
    private Boolean isActive;
}