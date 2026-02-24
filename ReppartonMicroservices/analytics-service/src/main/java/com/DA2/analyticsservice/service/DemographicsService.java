package com.DA2.analyticsservice.service;

import com.DA2.analyticsservice.entity.ListenHistory;
import com.DA2.analyticsservice.repository.ListenHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DemographicsService {

    @Autowired
    private ListenHistoryRepository listenHistoryRepository;

    /**
     * Get comprehensive demographics for artist
     */
    public Map<String, Object> getArtistDemographics(String artistId) {
        List<ListenHistory> listens = listenHistoryRepository.findByArtistIdOrderByCreatedAtDesc(artistId);
        
        Map<String, Object> demographics = new HashMap<>();
        demographics.put("totalListeners", getUniqueListenersCount(listens));
        demographics.put("ageGroups", calculateAgeGroups(listens));
        demographics.put("locations", calculateLocationDistribution(listens));
        demographics.put("gender", calculateGenderDistribution(listens));
        demographics.put("topCountries", getTopCountries(listens, 10));
        demographics.put("topCities", getTopCities(listens, 10));
        
        return demographics;
    }

    /**
     * Get demographics for specific song
     */
    public Map<String, Object> getSongDemographics(String songId) {
        List<ListenHistory> listens = listenHistoryRepository.findBySongIdOrderByCreatedAtDesc(songId);
        
        Map<String, Object> demographics = new HashMap<>();
        demographics.put("totalListeners", getUniqueListenersCount(listens));
        demographics.put("ageGroups", calculateAgeGroups(listens));
        demographics.put("locations", calculateLocationDistribution(listens));
        demographics.put("gender", calculateGenderDistribution(listens));
        
        return demographics;
    }

    /**
     * Get location distribution
     */
    public Map<String, Object> getLocationDistribution(String artistId) {
        List<ListenHistory> listens = listenHistoryRepository.findByArtistIdOrderByCreatedAtDesc(artistId);
        
        Map<String, Object> locations = new HashMap<>();
        locations.put("countries", calculateLocationDistribution(listens));
        locations.put("topCountries", getTopCountries(listens, 10));
        locations.put("topCities", getTopCities(listens, 10));
        
        return locations;
    }

    /**
     * Get age distribution
     */
    public Map<String, Object> getAgeDistribution(String artistId) {
        List<ListenHistory> listens = listenHistoryRepository.findByArtistIdOrderByCreatedAtDesc(artistId);
        
        Map<String, Object> ageData = new HashMap<>();
        ageData.put("ageGroups", calculateAgeGroups(listens));
        ageData.put("averageAge", calculateAverageAge(listens));
        
        return ageData;
    }

    /**
     * Get gender distribution
     */
    public Map<String, Object> getGenderDistribution(String artistId) {
        List<ListenHistory> listens = listenHistoryRepository.findByArtistIdOrderByCreatedAtDesc(artistId);
        
        Map<String, Object> genderData = new HashMap<>();
        genderData.put("distribution", calculateGenderDistribution(listens));
        
        return genderData;
    }

    // Helper methods

    private long getUniqueListenersCount(List<ListenHistory> listens) {
        return listens.stream()
                .map(ListenHistory::getUserId)
                .distinct()
                .count();
    }

    private Map<String, Object> calculateAgeGroups(List<ListenHistory> listens) {
        // Simulate age groups based on user behavior patterns
        // In production, this would query user table for actual ages
        Map<String, Integer> ageGroups = new HashMap<>();
        int total = listens.size();
        
        // Simulated distribution
        ageGroups.put("13-17", (int)(total * 0.15)); // 15%
        ageGroups.put("18-24", (int)(total * 0.35)); // 35%
        ageGroups.put("25-34", (int)(total * 0.30)); // 30%
        ageGroups.put("35-44", (int)(total * 0.12)); // 12%
        ageGroups.put("45+", (int)(total * 0.08));   // 8%
        
        Map<String, Object> result = new HashMap<>();
        result.put("groups", ageGroups);
        result.put("total", total);
        
        return result;
    }

    private Map<String, Object> calculateLocationDistribution(List<ListenHistory> listens) {
        // Simulate location distribution
        // In production, this would use IP geolocation data
        Map<String, Integer> countries = new HashMap<>();
        int total = listens.size();
        
        countries.put("Vietnam", (int)(total * 0.45));
        countries.put("United States", (int)(total * 0.20));
        countries.put("Thailand", (int)(total * 0.10));
        countries.put("Philippines", (int)(total * 0.08));
        countries.put("Singapore", (int)(total * 0.07));
        countries.put("Others", (int)(total * 0.10));
        
        Map<String, Object> result = new HashMap<>();
        result.put("countries", countries);
        result.put("total", total);
        
        return result;
    }

    private Map<String, Object> calculateGenderDistribution(List<ListenHistory> listens) {
        // Simulate gender distribution
        // In production, this would query user profile data
        Map<String, Integer> gender = new HashMap<>();
        int total = listens.size();
        
        gender.put("Male", (int)(total * 0.52));     // 52%
        gender.put("Female", (int)(total * 0.45));   // 45%
        gender.put("Other", (int)(total * 0.03));    // 3%
        
        Map<String, Object> result = new HashMap<>();
        result.put("distribution", gender);
        result.put("total", total);
        
        return result;
    }

    private List<Map<String, Object>> getTopCountries(List<ListenHistory> listens, int limit) {
        Map<String, Integer> countryCounts = new HashMap<>();
        
        // Simulate country data
        countryCounts.put("Vietnam", (int)(listens.size() * 0.45));
        countryCounts.put("United States", (int)(listens.size() * 0.20));
        countryCounts.put("Thailand", (int)(listens.size() * 0.10));
        countryCounts.put("Philippines", (int)(listens.size() * 0.08));
        countryCounts.put("Singapore", (int)(listens.size() * 0.07));
        
        return countryCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> country = new HashMap<>();
                    country.put("country", entry.getKey());
                    country.put("listeners", entry.getValue());
                    country.put("percentage", (entry.getValue() * 100.0) / listens.size());
                    return country;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getTopCities(List<ListenHistory> listens, int limit) {
        Map<String, Integer> cityCounts = new HashMap<>();
        
        // Simulate city data
        cityCounts.put("Ho Chi Minh City", (int)(listens.size() * 0.25));
        cityCounts.put("Hanoi", (int)(listens.size() * 0.15));
        cityCounts.put("New York", (int)(listens.size() * 0.10));
        cityCounts.put("Bangkok", (int)(listens.size() * 0.08));
        cityCounts.put("Manila", (int)(listens.size() * 0.06));
        
        return cityCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> city = new HashMap<>();
                    city.put("city", entry.getKey());
                    city.put("listeners", entry.getValue());
                    city.put("percentage", (entry.getValue() * 100.0) / listens.size());
                    return city;
                })
                .collect(Collectors.toList());
    }

    private double calculateAverageAge(List<ListenHistory> listens) {
        // Simulated average age calculation
        // Based on age group distribution
        return 26.5; // Average age of listeners
    }
}
