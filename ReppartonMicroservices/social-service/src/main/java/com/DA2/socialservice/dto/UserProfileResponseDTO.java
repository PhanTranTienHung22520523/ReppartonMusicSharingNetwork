package com.DA2.socialservice.dto;

/**
 * Matches user-service public profile response: { user: {...}, followerNumber, followingNumber, postsCount, songsCount }
 */
public class UserProfileResponseDTO {
    private UserDTO user;
    private long followerNumber;
    private long followingNumber;
    private long postsCount;
    private long songsCount;

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public long getFollowerNumber() {
        return followerNumber;
    }

    public void setFollowerNumber(long followerNumber) {
        this.followerNumber = followerNumber;
    }

    public long getFollowingNumber() {
        return followingNumber;
    }

    public void setFollowingNumber(long followingNumber) {
        this.followingNumber = followingNumber;
    }

    public long getPostsCount() {
        return postsCount;
    }

    public void setPostsCount(long postsCount) {
        this.postsCount = postsCount;
    }

    public long getSongsCount() {
        return songsCount;
    }

    public void setSongsCount(long songsCount) {
        this.songsCount = songsCount;
    }
}
