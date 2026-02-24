package com.DA2.analyticsservice.admin.controller;

import com.DA2.analyticsservice.admin.repository.AdminArtistPlaysDailyRepository;
import com.DA2.analyticsservice.admin.repository.AdminJobStateRepository;
import com.DA2.analyticsservice.admin.repository.AdminSearchQueryDailyRepository;
import com.DA2.analyticsservice.admin.repository.AdminSongPlaysDailyRepository;
import com.DA2.analyticsservice.admin.repository.AdminUserListensDailyRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics/admin/metrics")
public class AdminMetricsController {

    private final AdminSongPlaysDailyRepository songPlaysDailyRepository;
    private final AdminArtistPlaysDailyRepository artistPlaysDailyRepository;
    private final AdminUserListensDailyRepository userListensDailyRepository;
    private final AdminSearchQueryDailyRepository searchQueryDailyRepository;
    private final AdminJobStateRepository jobStateRepository;

    public AdminMetricsController(
            AdminSongPlaysDailyRepository songPlaysDailyRepository,
            AdminArtistPlaysDailyRepository artistPlaysDailyRepository,
            AdminUserListensDailyRepository userListensDailyRepository,
            AdminSearchQueryDailyRepository searchQueryDailyRepository,
            AdminJobStateRepository jobStateRepository
    ) {
        this.songPlaysDailyRepository = songPlaysDailyRepository;
        this.artistPlaysDailyRepository = artistPlaysDailyRepository;
        this.userListensDailyRepository = userListensDailyRepository;
        this.searchQueryDailyRepository = searchQueryDailyRepository;
        this.jobStateRepository = jobStateRepository;
    }

    public record SongPlaysItem(String songId, long plays) {}
    public record ArtistPlaysItem(String artistId, long plays) {}
    public record UserListensItem(String userId, long listens) {}
    public record SearchQueryItem(String searchQuery, long searches) {}

    @GetMapping("/songs/plays/top")
    public List<SongPlaysItem> topSongs(
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(name = "limit", defaultValue = "20") int limit
    ) {
        return songPlaysDailyRepository.findTopSongsByPlaysBetween(from, to, limit).stream()
                .map(r -> new SongPlaysItem(r.getSongId(), r.getPlays()))
                .toList();
    }

    @GetMapping("/artists/plays/top")
    public List<ArtistPlaysItem> topArtists(
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(name = "limit", defaultValue = "20") int limit
    ) {
        return artistPlaysDailyRepository.findTopArtistsByPlaysBetween(from, to, limit).stream()
                .map(r -> new ArtistPlaysItem(r.getArtistId(), r.getPlays()))
                .toList();
    }

    @GetMapping("/users/listens/top")
    public List<UserListensItem> topUsers(
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(name = "limit", defaultValue = "20") int limit
    ) {
        return userListensDailyRepository.findTopUsersByListensBetween(from, to, limit).stream()
                .map(r -> new UserListensItem(r.getUserId(), r.getListens()))
                .toList();
    }

    @GetMapping("/searches/top")
    public List<SearchQueryItem> topSearches(
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(name = "limit", defaultValue = "20") int limit
    ) {
        return searchQueryDailyRepository.findTopQueriesBetween(from, to, limit).stream()
                .map(r -> new SearchQueryItem(r.getSearchQuery(), r.getSearches()))
                .toList();
    }

    @GetMapping("/job-state")
    public Object jobState() {
        // Small helper endpoint for admin UI/verification
        return jobStateRepository.findAll();
    }
}
