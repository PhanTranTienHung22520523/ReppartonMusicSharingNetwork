package com.DA2.Repparton.Repository;

import com.DA2.Repparton.Entity.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepo extends MongoRepository<Comment, String> {
    List<Comment> findBySongId(String songId);
    List<Comment> findByPostId(String postId);
    List<Comment> findByPlaylistId(String playlistId);
    List<Comment> findByParentId(String parentId);
    List<Comment> findByUserId(String userId);
    List<Comment> findBySongIdAndParentIdIsNull(String songId); // Top-level comments cho song
    List<Comment> findByPostIdAndParentIdIsNull(String postId); // Top-level comments cho post
    List<Comment> findByPlaylistIdAndParentIdIsNull(String playlistId); // Top-level comments cho playlist
}
