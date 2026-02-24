package com.DA2.analyticsservice.controller;

import com.DA2.analyticsservice.service.DemographicsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics/demographics")
@CrossOrigin(origins = "*")
public class DemographicsController {

    @Autowired
    private DemographicsService demographicsService;

    /**
     * Get demographics data for artist's listeners
     * Includes age groups, location distribution, and gender breakdown
     */
    @GetMapping("/artist/{artistId}")
    public ResponseEntity<?> getArtistDemographics(@PathVariable("artistId") String artistId) {
        try {
            Map<String, Object> demographics = demographicsService.getArtistDemographics(artistId);
            return ResponseEntity.ok(demographics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Get demographics data for a specific song
     */
    @GetMapping("/song/{songId}")
    public ResponseEntity<?> getSongDemographics(@PathVariable("songId") String songId) {
        try {
            Map<String, Object> demographics = demographicsService.getSongDemographics(songId);
            return ResponseEntity.ok(demographics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Get location distribution for artist
     */
    @GetMapping("/artist/{artistId}/locations")
    public ResponseEntity<?> getLocationDistribution(@PathVariable("artistId") String artistId) {
        try {
            Map<String, Object> locations = demographicsService.getLocationDistribution(artistId);
            return ResponseEntity.ok(locations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Get age distribution for artist
     */
    @GetMapping("/artist/{artistId}/age-groups")
    public ResponseEntity<?> getAgeDistribution(@PathVariable("artistId") String artistId) {
        try {
            Map<String, Object> ageGroups = demographicsService.getAgeDistribution(artistId);
            return ResponseEntity.ok(ageGroups);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Get gender distribution for artist
     */
    @GetMapping("/artist/{artistId}/gender")
    public ResponseEntity<?> getGenderDistribution(@PathVariable("artistId") String artistId) {
        try {
            Map<String, Object> gender = demographicsService.getGenderDistribution(artistId);
            return ResponseEntity.ok(gender);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
}
