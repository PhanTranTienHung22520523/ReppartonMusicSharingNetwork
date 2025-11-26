package com.DA2.postservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocationService {

    private final RestTemplate restTemplate;

    @Value("${google.maps.api.key:}")
    private String googleMapsApiKey;

    /**
     * Reverse geocode coordinates to get location name
     */
    public String reverseGeocode(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return null;
        }

        try {
            String url = String.format(
                "https://maps.googleapis.com/maps/api/geocode/json?latlng=%f,%f&key=%s",
                latitude, longitude, googleMapsApiKey
            );

            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            Map<String, Object> body = response.getBody();

            if (body != null && "OK".equals(body.get("status"))) {
                @SuppressWarnings("unchecked")
                java.util.List<Map<String, Object>> results = (java.util.List<Map<String, Object>>) body.get("results");
                if (!results.isEmpty()) {
                    Map<String, Object> firstResult = results.get(0);
                    return (String) firstResult.get("formatted_address");
                }
            }
        } catch (Exception e) {
            log.error("Failed to reverse geocode coordinates: {}, {}", latitude, longitude, e);
        }

        return null;
    }

    /**
     * Geocode location name to get coordinates
     */
    public Map<String, Double> geocode(String locationName) {
        if (locationName == null || locationName.trim().isEmpty()) {
            return null;
        }

        try {
            String url = String.format(
                "https://maps.googleapis.com/maps/api/geocode/json?address=%s&key=%s",
                java.net.URLEncoder.encode(locationName, "UTF-8"),
                googleMapsApiKey
            );

            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            Map<String, Object> body = response.getBody();

            if (body != null && "OK".equals(body.get("status"))) {
                @SuppressWarnings("unchecked")
                java.util.List<Map<String, Object>> results = (java.util.List<Map<String, Object>>) body.get("results");
                if (!results.isEmpty()) {
                    Map<String, Object> firstResult = results.get(0);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> geometry = (Map<String, Object>) firstResult.get("geometry");
                    @SuppressWarnings("unchecked")
                    Map<String, Object> location = (Map<String, Object>) geometry.get("location");

                    Map<String, Double> coordinates = new HashMap<>();
                    coordinates.put("latitude", (Double) location.get("lat"));
                    coordinates.put("longitude", (Double) location.get("lng"));
                    return coordinates;
                }
            }
        } catch (Exception e) {
            log.error("Failed to geocode location: {}", locationName, e);
        }

        return null;
    }

    /**
     * Validate coordinates are within valid range
     */
    public boolean isValidCoordinates(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return false;
        }
        return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    public double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return 0.0;
        }

        final int R = 6371; // Radius of the earth in km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c;

        return distance; // in km
    }

    /**
     * Get nearby locations within radius
     */
    public java.util.List<String> getNearbyLocations(Double latitude, Double longitude, double radiusKm) {
        // This would typically call a places API
        // For now, return empty list
        return new java.util.ArrayList<>();
    }
}