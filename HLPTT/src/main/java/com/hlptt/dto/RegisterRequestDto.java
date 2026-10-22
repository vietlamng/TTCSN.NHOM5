package com.hlptt.dto;

import lombok.Data;

@Data
public class RegisterRequestDto {
    private String fullName;
    private String phone;
    private String email;
    private String password;
}