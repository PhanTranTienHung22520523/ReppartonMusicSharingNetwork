package com.DA2.Repparton.Service;

import com.DA2.Repparton.Entity.Share;
import com.DA2.Repparton.Repository.ShareRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShareService {
    @Autowired
    private ShareRepo shareRepository;

    public Share shareSong(String userId, String songId, String platform) {
        Share share = new Share(null, userId, songId, platform, LocalDateTime.now());
        return shareRepository.save(share);
    }

    public List<Share> getSharesBySong(String songId) {
        return shareRepository.findBySongId(songId);
    }

    public List<Share> getSharesByUser(String userId) {
        return shareRepository.findByUserId(userId);
    }
}

