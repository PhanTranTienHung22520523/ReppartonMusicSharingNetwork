package com.DA2.analyticsservice.admin.job;

import com.DA2.analyticsservice.admin.entity.AdminJobState;
import com.DA2.analyticsservice.admin.repository.AdminArtistPlaysDailyRepository;
import com.DA2.analyticsservice.admin.repository.AdminJobStateRepository;
import com.DA2.analyticsservice.admin.repository.AdminSearchQueryDailyRepository;
import com.DA2.analyticsservice.admin.repository.AdminSongPlaysDailyRepository;
import com.DA2.analyticsservice.admin.repository.AdminUserListensDailyRepository;
import com.DA2.analyticsservice.entity.ListenHistory;
import com.DA2.analyticsservice.entity.SearchHistory;
import com.DA2.analyticsservice.repository.ListenHistoryRepository;
import com.DA2.analyticsservice.repository.SearchHistoryRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class AdminMetricsAggregationJob {

    private static final String JOB_LISTEN = "admin_metrics_listen_v1";
    private static final String JOB_SEARCH = "admin_metrics_search_v1";

    private final AdminJobStateRepository jobStateRepository;
    private final ListenHistoryRepository listenHistoryRepository;
    private final SearchHistoryRepository searchHistoryRepository;

    private final AdminSongPlaysDailyRepository songPlaysDailyRepository;
    private final AdminArtistPlaysDailyRepository artistPlaysDailyRepository;
    private final AdminUserListensDailyRepository userListensDailyRepository;
    private final AdminSearchQueryDailyRepository searchQueryDailyRepository;

    public AdminMetricsAggregationJob(
            AdminJobStateRepository jobStateRepository,
            ListenHistoryRepository listenHistoryRepository,
            SearchHistoryRepository searchHistoryRepository,
            AdminSongPlaysDailyRepository songPlaysDailyRepository,
            AdminArtistPlaysDailyRepository artistPlaysDailyRepository,
            AdminUserListensDailyRepository userListensDailyRepository,
            AdminSearchQueryDailyRepository searchQueryDailyRepository
    ) {
        this.jobStateRepository = jobStateRepository;
        this.listenHistoryRepository = listenHistoryRepository;
        this.searchHistoryRepository = searchHistoryRepository;
        this.songPlaysDailyRepository = songPlaysDailyRepository;
        this.artistPlaysDailyRepository = artistPlaysDailyRepository;
        this.userListensDailyRepository = userListensDailyRepository;
        this.searchQueryDailyRepository = searchQueryDailyRepository;
    }

    @Scheduled(fixedDelayString = "${admin.metrics.aggregation.fixedDelayMs:300000}")
    public void run() {
        aggregateListens();
        aggregateSearches();
    }

    private void aggregateListens() {
        AdminJobState state = jobStateRepository.findById(JOB_LISTEN)
                .orElseGet(() -> new AdminJobState(JOB_LISTEN, LocalDateTime.of(1970, 1, 1, 0, 0)));

        LocalDateTime from = state.getLastProcessedAt();
        LocalDateTime to = LocalDateTime.now();

        List<ListenHistory> rows = listenHistoryRepository.findByCreatedAtAfterAndCreatedAtLessThanEqual(from, to);
        if (rows.isEmpty()) {
            state.setLastProcessedAt(to);
            jobStateRepository.save(state);
            return;
        }

        Map<SongDayKey, Long> songCounts = new HashMap<>();
        Map<ArtistDayKey, Long> artistCounts = new HashMap<>();
        Map<UserDayKey, Long> userCounts = new HashMap<>();

        for (ListenHistory h : rows) {
            LocalDate day = h.getCreatedAt().toLocalDate();

            songCounts.merge(new SongDayKey(day, h.getSongId()), 1L, Long::sum);
            userCounts.merge(new UserDayKey(day, h.getUserId()), 1L, Long::sum);

            if (h.getArtistId() != null && !h.getArtistId().isBlank()) {
                artistCounts.merge(new ArtistDayKey(day, h.getArtistId()), 1L, Long::sum);
            }
        }

        for (Map.Entry<SongDayKey, Long> e : songCounts.entrySet()) {
            songPlaysDailyRepository.increment(e.getKey().day, e.getKey().songId, e.getValue());
        }
        for (Map.Entry<ArtistDayKey, Long> e : artistCounts.entrySet()) {
            artistPlaysDailyRepository.increment(e.getKey().day, e.getKey().artistId, e.getValue());
        }
        for (Map.Entry<UserDayKey, Long> e : userCounts.entrySet()) {
            userListensDailyRepository.increment(e.getKey().day, e.getKey().userId, e.getValue());
        }

        state.setLastProcessedAt(to);
        jobStateRepository.save(state);
    }

    private void aggregateSearches() {
        AdminJobState state = jobStateRepository.findById(JOB_SEARCH)
                .orElseGet(() -> new AdminJobState(JOB_SEARCH, LocalDateTime.of(1970, 1, 1, 0, 0)));

        LocalDateTime from = state.getLastProcessedAt();
        LocalDateTime to = LocalDateTime.now();

        List<SearchHistory> rows = searchHistoryRepository.findBySearchedAtAfterAndSearchedAtLessThanEqual(from, to);
        if (rows.isEmpty()) {
            state.setLastProcessedAt(to);
            jobStateRepository.save(state);
            return;
        }

        Map<SearchDayKey, Long> queryCounts = new HashMap<>();
        for (SearchHistory h : rows) {
            LocalDate day = h.getSearchedAt().toLocalDate();
            String query = (h.getSearchQuery() == null) ? "" : h.getSearchQuery().trim();
            if (query.isEmpty()) continue;
            queryCounts.merge(new SearchDayKey(day, query), 1L, Long::sum);
        }

        for (Map.Entry<SearchDayKey, Long> e : queryCounts.entrySet()) {
            searchQueryDailyRepository.increment(e.getKey().day, e.getKey().query, e.getValue());
        }

        state.setLastProcessedAt(to);
        jobStateRepository.save(state);
    }

    private record SongDayKey(LocalDate day, String songId) {}

    private record ArtistDayKey(LocalDate day, String artistId) {}

    private record UserDayKey(LocalDate day, String userId) {}

    private record SearchDayKey(LocalDate day, String query) {}
}
