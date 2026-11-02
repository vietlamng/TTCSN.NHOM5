package com.hlptt.dto;

import lombok.Data;

@Data
public class BrandRequestDto {
    private String brandName;
    private String slug;
    private String description;
    private String logo;
    private Boolean isActive;
}