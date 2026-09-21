package com.example.fooddelivery.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleUserInfo {
    private String subject;
    private String email;
    private String name;
    private String picture;
    private Boolean emailVerified;
}
