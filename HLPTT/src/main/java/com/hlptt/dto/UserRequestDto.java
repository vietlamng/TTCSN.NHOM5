package com.hlptt.dto;

import lombok.Data;

@Data
public class UserRequestDto {
    private String email;
    private String password; 
    private String fullName;
    private String phone;
    private Integer roleId;
    private Boolean isActive;
}