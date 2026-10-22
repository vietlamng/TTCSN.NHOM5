package com.hlptt.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CategorySummaryDto {
    private Integer id;
    private String name;
    private String slug;
    private String image;
    private Long productCount;
    private Integer displayOrder;
}

