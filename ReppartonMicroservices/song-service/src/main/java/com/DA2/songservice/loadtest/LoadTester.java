package com.DA2.songservice.loadtest;

import java.io.FileWriter;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Enhanced Load Testing Tool for Song Service
 * Tests concurrent requests to key endpoints with detailed metrics
 */
public class LoadTester {

    private static final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private static final String BASE_URL = "http://localhost:8082"; // Song service port

    // Test configuration
    private static final int DEFAULT_THREAD_POOL_SIZE = 20;
    private static final boolean EXPORT_RESULTS = true;
    private static final String RESULTS_FILE = "load_test_results.csv";

    public static void main(String[] args) {
        System.out.println("🎯 Starting Enhanced Load Test for Song Service");
        System.out.println("===============================================");
        System.out.println("Test Configuration:");
        System.out.println("- Base URL: " + BASE_URL);
        System.out.println("- Thread Pool: " + DEFAULT_THREAD_POOL_SIZE);
        System.out.println("- Results Export: " + (EXPORT_RESULTS ? "Enabled" : "Disabled"));
        System.out.println();

        // Test scenarios with different loads
        runHealthCheckTest(100);
        runGetSongsTest(50);
        runSearchTest(30);
        runLyricsAPITest(20);
        runAIAnalysisTest(15);
        runConcurrentLoadTest(200);

        System.out.println("\n✅ Enhanced load testing completed!");
        if (EXPORT_RESULTS) {
            System.out.println("📊 Results exported to: " + RESULTS_FILE);
        }
    }

    private static void runHealthCheckTest(int requestCount) {
        System.out.println("\n🏥 Testing Health Check Endpoint (" + requestCount + " requests)");
        System.out.println("------------------------------------------------------");

        TestResult result = runLoadTest("/actuator/health", requestCount, DEFAULT_THREAD_POOL_SIZE);
        printTestResults("Health Check", result);
        exportResults("Health Check", result);
    }

    private static void runGetSongsTest(int requestCount) {
        System.out.println("\n🎵 Testing Get All Songs Endpoint (" + requestCount + " requests)");
        System.out.println("--------------------------------------------------------");

        TestResult result = runLoadTest("/api/songs", requestCount, DEFAULT_THREAD_POOL_SIZE);
        printTestResults("Get Songs", result);
        exportResults("Get Songs", result);
    }

    private static void runSearchTest(int requestCount) {
        System.out.println("\n🔍 Testing Search Endpoint (" + requestCount + " requests)");
        System.out.println("--------------------------------------------------");

        TestResult result = runSearchLoadTest(requestCount, DEFAULT_THREAD_POOL_SIZE);
        printTestResults("Search", result);
        exportResults("Search", result);
    }

    private static void runLyricsAPITest(int requestCount) {
        System.out.println("\n📝 Testing Lyrics API Endpoints (" + requestCount + " requests)");
        System.out.println("--------------------------------------------------------");

        // Test different lyrics endpoints
        String[] lyricsEndpoints = {
            "/api/songs/search/lyrics?query=love",
            "/api/songs/1/lyrics",  // Assuming song with ID 1 exists
            "/api/songs/1/lyrics/synced"
        };

        TestResult result = runMixedEndpointsTest(lyricsEndpoints, requestCount, DEFAULT_THREAD_POOL_SIZE);
        printTestResults("Lyrics API", result);
        exportResults("Lyrics API", result);
    }

    private static void runAIAnalysisTest(int requestCount) {
        System.out.println("\n🤖 Testing AI Analysis Endpoints (" + requestCount + " requests)");
        System.out.println("--------------------------------------------------------");

        // Test AI analysis endpoints (these might be slower)
        String[] aiEndpoints = {
            "/api/songs/1/analysis",  // Get AI analysis
            "/api/songs/by-key/C Major",  // Search by key
            "/api/songs/by-mood/happy"   // Search by mood
        };

        TestResult result = runMixedEndpointsTest(aiEndpoints, requestCount, Math.min(DEFAULT_THREAD_POOL_SIZE, 10));
        printTestResults("AI Analysis", result);
        exportResults("AI Analysis", result);
    }

    private static void runConcurrentLoadTest(int requestCount) {
        System.out.println("\n🚀 Running Concurrent Load Test (Mixed Endpoints) (" + requestCount + " requests)");
        System.out.println("---------------------------------------------------------------------");

        String[] endpoints = {
            "/actuator/health",
            "/api/songs",
            "/api/songs/search?query=test",
            "/api/songs/1/lyrics",
            "/api/songs/by-key/C Major"
        };

        TestResult result = runMixedEndpointsTest(endpoints, requestCount, DEFAULT_THREAD_POOL_SIZE);
        printTestResults("Concurrent Load Test", result);

        // Export results
        exportResults("Concurrent Load Test", result);
    }

    /**
     * Test result data structure
     */
    static class TestResult {
        int totalRequests;
        int successCount;
        int errorCount;
        long totalDurationMs;
        List<Long> responseTimes;
        Map<Integer, Integer> errorCodes;

        TestResult(int totalRequests) {
            this.totalRequests = totalRequests;
            this.responseTimes = new ArrayList<>();
            this.errorCodes = new HashMap<>();
        }

        double getRequestsPerSecond() {
            return (double) totalRequests / (totalDurationMs / 1000.0);
        }

        long getMinResponseTime() {
            return responseTimes.stream().mapToLong(Long::longValue).min().orElse(0);
        }

        long getMaxResponseTime() {
            return responseTimes.stream().mapToLong(Long::longValue).max().orElse(0);
        }

        double getAvgResponseTime() {
            return responseTimes.stream().mapToLong(Long::longValue).average().orElse(0);
        }

        long getPercentileResponseTime(double percentile) {
            if (responseTimes.isEmpty()) return 0;
            List<Long> sorted = responseTimes.stream().sorted().collect(Collectors.toList());
            int index = (int) Math.ceil(percentile / 100.0 * sorted.size()) - 1;
            return sorted.get(Math.max(0, Math.min(index, sorted.size() - 1)));
        }
    }

    /**
     * Run load test for a single endpoint
     */
    private static TestResult runLoadTest(String endpoint, int requestCount, int threadPoolSize) {
        TestResult result = new TestResult(requestCount);
        Instant start = Instant.now();

        ExecutorService executor = Executors.newFixedThreadPool(threadPoolSize);
        List<CompletableFuture<Void>> futures = new ArrayList<>();

        for (int i = 0; i < requestCount; i++) {
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                Instant requestStart = Instant.now();
                try {
                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create(BASE_URL + endpoint))
                            .GET()
                            .build();

                    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                    Instant requestEnd = Instant.now();

                    long responseTime = Duration.between(requestStart, requestEnd).toMillis();
                    synchronized (result.responseTimes) {
                        result.responseTimes.add(responseTime);
                    }

                    if (response.statusCode() == 200) {
                        result.successCount++;
                    } else {
                        result.errorCount++;
                        synchronized (result.errorCodes) {
                            result.errorCodes.put(response.statusCode(),
                                result.errorCodes.getOrDefault(response.statusCode(), 0) + 1);
                        }
                    }
                } catch (Exception e) {
                    result.errorCount++;
                    synchronized (result.responseTimes) {
                        result.responseTimes.add(Duration.between(requestStart, Instant.now()).toMillis());
                    }
                }
            }, executor);
            futures.add(future);
        }

        // Wait for all requests to complete
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        executor.shutdown();

        result.totalDurationMs = Duration.between(start, Instant.now()).toMillis();
        return result;
    }

    /**
     * Run load test for search endpoint with different queries
     */
    private static TestResult runSearchLoadTest(int requestCount, int threadPoolSize) {
        TestResult result = new TestResult(requestCount);
        Instant start = Instant.now();

        String[] queries = {"love", "rock", "pop", "jazz", "test", "music", "electronic", "classical"};
        ExecutorService executor = Executors.newFixedThreadPool(threadPoolSize);
        List<CompletableFuture<Void>> futures = new ArrayList<>();

        for (int i = 0; i < requestCount; i++) {
            String query = queries[i % queries.length];
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                Instant requestStart = Instant.now();
                try {
                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create(BASE_URL + "/api/songs/search?query=" + query))
                            .GET()
                            .build();

                    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                    Instant requestEnd = Instant.now();

                    long responseTime = Duration.between(requestStart, requestEnd).toMillis();
                    synchronized (result.responseTimes) {
                        result.responseTimes.add(responseTime);
                    }

                    if (response.statusCode() == 200) {
                        result.successCount++;
                    } else {
                        result.errorCount++;
                        synchronized (result.errorCodes) {
                            result.errorCodes.put(response.statusCode(),
                                result.errorCodes.getOrDefault(response.statusCode(), 0) + 1);
                        }
                    }
                } catch (Exception e) {
                    result.errorCount++;
                    synchronized (result.responseTimes) {
                        result.responseTimes.add(Duration.between(requestStart, Instant.now()).toMillis());
                    }
                }
            }, executor);
            futures.add(future);
        }

        // Wait for all requests to complete
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        executor.shutdown();

        result.totalDurationMs = Duration.between(start, Instant.now()).toMillis();
        return result;
    }

    /**
     * Run load test for mixed endpoints
     */
    private static TestResult runMixedEndpointsTest(String[] endpoints, int requestCount, int threadPoolSize) {
        TestResult result = new TestResult(requestCount);
        Instant start = Instant.now();

        ExecutorService executor = Executors.newFixedThreadPool(threadPoolSize);
        List<CompletableFuture<Void>> futures = new ArrayList<>();

        for (int i = 0; i < requestCount; i++) {
            String endpoint = endpoints[i % endpoints.length];
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                Instant requestStart = Instant.now();
                try {
                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create(BASE_URL + endpoint))
                            .GET()
                            .build();

                    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                    Instant requestEnd = Instant.now();

                    long responseTime = Duration.between(requestStart, requestEnd).toMillis();
                    synchronized (result.responseTimes) {
                        result.responseTimes.add(responseTime);
                    }

                    if (response.statusCode() == 200) {
                        result.successCount++;
                    } else {
                        result.errorCount++;
                        synchronized (result.errorCodes) {
                            result.errorCodes.put(response.statusCode(),
                                result.errorCodes.getOrDefault(response.statusCode(), 0) + 1);
                        }
                    }
                } catch (Exception e) {
                    result.errorCount++;
                    synchronized (result.responseTimes) {
                        result.responseTimes.add(Duration.between(requestStart, Instant.now()).toMillis());
                    }
                }
            }, executor);
            futures.add(future);
        }

        // Wait for all requests to complete
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        executor.shutdown();

        result.totalDurationMs = Duration.between(start, Instant.now()).toMillis();
        return result;
    }

    /**
     * Print detailed test results
     */
    private static void printTestResults(String testName, TestResult result) {
        System.out.println("📊 " + testName + " Results:");
        System.out.println("------------------------------");
        System.out.printf("✅ Success: %d (%.1f%%)%n", result.successCount,
            (double) result.successCount / result.totalRequests * 100);
        System.out.printf("❌ Errors: %d (%.1f%%)%n", result.errorCount,
            (double) result.errorCount / result.totalRequests * 100);
        System.out.printf("⏱️ Total Duration: %d ms%n", result.totalDurationMs);
        System.out.printf("📈 Throughput: %.2f requests/second%n", result.getRequestsPerSecond());

        if (!result.responseTimes.isEmpty()) {
            System.out.println("\nResponse Time Metrics:");
            System.out.printf("  Min: %d ms%n", result.getMinResponseTime());
            System.out.printf("  Max: %d ms%n", result.getMaxResponseTime());
            System.out.printf("  Avg: %.1f ms%n", result.getAvgResponseTime());
            System.out.printf("  95th percentile: %d ms%n", result.getPercentileResponseTime(95));
            System.out.printf("  99th percentile: %d ms%n", result.getPercentileResponseTime(99));
        }

        if (!result.errorCodes.isEmpty()) {
            System.out.println("\nError Code Distribution:");
            result.errorCodes.forEach((code, count) ->
                System.out.printf("  %d: %d times%n", code, count));
        }

        // Performance assessment
        double rps = result.getRequestsPerSecond();
        double avgResponseTime = result.getAvgResponseTime();
        double errorRate = (double) result.errorCount / result.totalRequests * 100;

        System.out.println("\nPerformance Assessment:");
        if (rps > 100 && avgResponseTime < 200 && errorRate < 1) {
            System.out.println("🎉 EXCELLENT: High throughput, fast responses, low errors");
        } else if (rps > 50 && avgResponseTime < 500 && errorRate < 5) {
            System.out.println("👍 GOOD: Acceptable performance for production");
        } else if (rps > 20 && avgResponseTime < 1000 && errorRate < 10) {
            System.out.println("⚠️ FAIR: May need optimization for high load");
        } else {
            System.out.println("❌ POOR: Requires immediate optimization");
        }

        System.out.println();
    }

    /**
     * Export results to CSV (simplified version)
     */
    private static void exportResults(String testName, TestResult result) {
        if (!EXPORT_RESULTS) return;

        try (FileWriter writer = new FileWriter(RESULTS_FILE, true)) {
            // Write header if file is new
            // This is a simplified version - in production you'd check if file exists
            writer.write(String.format("%s,%d,%d,%d,%d,%.2f,%.1f,%d,%d,%d%n",
                testName,
                result.totalRequests,
                result.successCount,
                result.errorCount,
                result.totalDurationMs,
                result.getRequestsPerSecond(),
                result.getAvgResponseTime(),
                result.getMinResponseTime(),
                result.getMaxResponseTime(),
                result.getPercentileResponseTime(95)
            ));
        } catch (IOException e) {
            System.out.println("⚠️ Failed to export results: " + e.getMessage());
        }
    }