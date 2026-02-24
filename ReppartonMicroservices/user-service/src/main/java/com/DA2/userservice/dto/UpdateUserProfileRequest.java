package com.DA2.userservice.dto;

import lombok.Data;

@Data
public class UpdateUserProfileRequest {
    private String displayName;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private String coverUrl;
    private String bio;
    private String website;
}
