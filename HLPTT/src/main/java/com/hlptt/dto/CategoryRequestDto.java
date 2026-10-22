package com.hlptt.dto;

import lombok.Data;

@Data
public class CategoryRequestDto {
    private String categoryName;
    private String slug;
    private String description;
    private Boolean isActive;
    private Integer displayOrder;
    private Integer parentId;
}