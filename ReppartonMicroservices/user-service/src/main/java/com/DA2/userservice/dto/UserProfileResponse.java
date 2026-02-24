package com.DA2.userservice.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UserProfileResponse {
    UserResponse user;
    long followerNumber;
    long followingNumber;
    long postsCount;
    long songsCount;
}
