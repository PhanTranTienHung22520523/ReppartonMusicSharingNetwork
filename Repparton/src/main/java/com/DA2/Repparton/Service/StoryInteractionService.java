package com.DA2.Repparton.Service;

import com.DA2.Repparton.Entity.StoryLike;
import com.DA2.Repparton.Entity.StoryView;
import com.DA2.Repparton.Repository.StoryLikeRepo;
import com.DA2.Repparton.Repository.StoryViewRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class StoryInteractionService {

    @Autowired
    private StoryLikeRepo likeRepo;

    @Autowired
    private StoryViewRepo viewRepo;

    public boolean likeStory(String storyId, String userId) {
        if (likeRepo.findByStoryIdAndUserId(storyId, userId).isPresent()) return false;
        likeRepo.save(new StoryLike(storyId, userId, LocalDateTime.now()));
        return true;
    }

    public boolean viewStory(String storyId, String userId) {
        if (viewRepo.findByStoryIdAndUserId(storyId, userId).isPresent()) return false;
        viewRepo.save(new StoryView(storyId, userId, LocalDateTime.now()));
        return true;
    }

    public long getLikes(String storyId) {
        return likeRepo.countByStoryId(storyId);
    }

    public long getViews(String storyId) {
        return viewRepo.countByStoryId(storyId);
    }
}
