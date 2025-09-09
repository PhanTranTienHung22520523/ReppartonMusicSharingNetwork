package com.DA2.Repparton.Service;

import com.DA2.Repparton.Entity.Like;
import com.DA2.Repparton.Entity.Post;
import com.DA2.Repparton.Entity.Song;
import com.DA2.Repparton.Repository.LikeRepo;
import com.DA2.Repparton.Repository.PostRepo;
import com.DA2.Repparton.Repository.SongRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class LikeService {

    @Autowired
    private LikeRepo likeRepo;

    @Autowired
    private SongRepo songRepo;

    @Autowired
    private PostRepo postRepo;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    @CacheEvict(value = {"songs", "posts", "trending"}, allEntries = true)
    public boolean toggleSongLike(String userId, String songId) {
        Optional<Like> existingLike = likeRepo.findByUserIdAndSongId(userId, songId);

        if (existingLike.isPresent()) {
            // Unlike
            likeRepo.delete(existingLike.get());
            decrementSongLikes(songId);
            System.out.println("User " + userId + " unliked song " + songId);
            return false;
        } else {
            // Sử dụng constructor có tham số cho song like
            Like like = new Like(userId, songId);

            likeRepo.save(like);
            incrementSongLikes(songId);

            // Notify song owner
            Optional<Song> songOpt = songRepo.findById(songId);
            if (songOpt.isPresent() && !songOpt.get().getArtistId().equals(userId)) {
                notificationService.sendNotification(
                    songOpt.get().getArtistId(),
                    "Someone liked your song: " + songOpt.get().getTitle(),
                    "SONG_LIKE",
                    songId
                );
            }

            System.out.println("User " + userId + " liked song " + songId);
            return true;
        }
    }

    @Transactional
    @CacheEvict(value = "posts", allEntries = true)
    public boolean togglePostLike(String userId, String postId) {
        Optional<Like> existingLike = likeRepo.findByUserIdAndPostId(userId, postId);

        if (existingLike.isPresent()) {
            // Unlike
            likeRepo.delete(existingLike.get());
            decrementPostLikes(postId);
            System.out.println("User " + userId + " unliked post " + postId);
            return false;
        } else {
            // Sử dụng constructor có tham số cho post like
            Like like = new Like(userId, postId, true);

            likeRepo.save(like);
            incrementPostLikes(postId);

            // Notify post owner
            Optional<Post> postOpt = postRepo.findById(postId);
            if (postOpt.isPresent() && !postOpt.get().getUserId().equals(userId)) {
                notificationService.sendNotification(
                    postOpt.get().getUserId(),
                    "Someone liked your post",
                    "POST_LIKE",
                    postId
                );
            }

            System.out.println("User " + userId + " liked post " + postId);
            return true;
        }
    }

    public boolean hasUserLikedSong(String userId, String songId) {
        return likeRepo.existsByUserIdAndSongId(userId, songId);
    }

    public boolean hasUserLikedPost(String userId, String postId) {
        return likeRepo.existsByUserIdAndPostId(userId, postId);
    }

    public long getSongLikeCount(String songId) {
        return likeRepo.countBySongId(songId);
    }

    public long getPostLikeCount(String postId) {
        return likeRepo.countByPostId(postId);
    }

    private void incrementSongLikes(String songId) {
        Optional<Song> songOpt = songRepo.findById(songId);
        if (songOpt.isPresent()) {
            Song song = songOpt.get();
            song.setLikes(song.getLikes() + 1);
            songRepo.save(song);
        }
    }

    private void decrementSongLikes(String songId) {
        Optional<Song> songOpt = songRepo.findById(songId);
        if (songOpt.isPresent()) {
            Song song = songOpt.get();
            song.setLikes(Math.max(0, song.getLikes() - 1));
            songRepo.save(song);
        }
    }

    private void incrementPostLikes(String postId) {
        Optional<Post> postOpt = postRepo.findById(postId);
        if (postOpt.isPresent()) {
            Post post = postOpt.get();
            post.setLikes(post.getLikes() + 1);
            postRepo.save(post);
        }
    }

    private void decrementPostLikes(String postId) {
        Optional<Post> postOpt = postRepo.findById(postId);
        if (postOpt.isPresent()) {
            Post post = postOpt.get();
            post.setLikes(Math.max(0, post.getLikes() - 1));
            postRepo.save(post);
        }
    }
}
