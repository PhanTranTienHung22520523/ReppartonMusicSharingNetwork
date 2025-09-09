package com.DA2.Repparton.DTO;

import com.DA2.Repparton.Entity.Song;
import com.DA2.Repparton.Entity.User;

import java.util.List;

public class ProfileDTO {
    User user;
    long followerNumber;
    long followingNumber;
    List<Song> songs;

    public ProfileDTO() {

    }

    public ProfileDTO(User user, long followerNumber, long followingNumber, List<Song> songs){
        this.user=user;
        this.followerNumber=followerNumber;
        this.followingNumber=followingNumber;
        this.songs=songs;
    }


    public User getUser() {
        return user;
    }

    public void setFollowerNumber(long followerNumber) {
        this.followerNumber = followerNumber;
    }

    public long getFollowerNumber() {
        return followerNumber;
    }

    public void setFollowingNumber(long followingNumber) {
        this.followingNumber = followingNumber;
    }

    public long getFollowingNumber() {
        return followingNumber;
    }

    public List<Song> getSongs() {
        return songs;
    }

    public void setSongs(List<Song> songs) {
        this.songs = songs;
    }
}
