package com.DA2.userservice.dto;

import com.DA2.userservice.entity.User;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PublicUserDTO {
    String id;
    String username;
    String fullName;
    String avatar;
    String role;
    boolean allowNormalUserMessages;

    public static PublicUserDTO fromEntity(User user) {
        if (user == null) {
            return null;
        }

        return PublicUserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .avatar(user.getAvatarUrl())
                .role(user.getRole())
                .allowNormalUserMessages(user.isAllowNormalUserMessages())
                .build();
    }
}
