package com.DA2.songservice.loadtest;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

/**
 * Advanced Stress Testing Tool for Song Service
 * Tests system under extreme conditions: sustained load, memory leaks, spikes
 */
public class StressTester {

    private static final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    private static final String BASE_URL = "http://localhost:8082";

    // Test results tracking
    private static final Map<String, TestMetrics> testResults = new ConcurrentHashMap<>();

    public static void main(String[] args) {
        System.out.println("🔥 ADVANCED STRESS TEST FOR SONG SERVICE");
        System.out.println("=======================================");

        // Run different stress test scenarios
        runSustainedLoadTest();
        runSpikeLoadTest();
        runMemoryLeakTest();
        runTimeoutTest();

        // Print comprehensive results
        printResults();

        System.out.println("\n✅ Stress testing completed!");
    }

    private static void runSustainedLoadTest() {
        System.out.println("\n🏃‍♂️ SUSTAINED LOAD TEST (10 minutes, moderate load)");
        System.out.println("--------------------------------------------------");

        TestMetrics metrics = new TestMetrics("Sustained Load");
        testResults.put("sustained", metrics);

        Instant testStart = Instant.now();
        ExecutorService executor = Executors.newFixedThreadPool(15);

        // Run for 10 minutes with moderate concurrent requests
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        AtomicInteger requestCount = new AtomicInteger(0);

        CountDownLatch completionLatch = new CountDownLatch(1);

        scheduler.schedule(() -> {
            System.out.println("⏰ Test duration reached, stopping...");
            executor.shutdown();
            try {
                if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
            }
            completionLatch.countDown();
        }, 10, TimeUnit.MINUTES);

        // Continuous request generation
        while (!executor.isShutdown()) {
            try {
                Thread.sleep(100); // Generate requests every 100ms

                executor.submit(() -> {
                    int reqNum = requestCount.incrementAndGet();
                    String endpoint = getRandomEndpoint();

                    Instant reqStart = Instant.now();
                    try {
                        HttpRequest request = HttpRequest.newBuilder()
                                .uri(URI.create(BASE_URL + endpoint))
                                .GET()
                                .timeout(Duration.ofSeconds(10))
                                .build();

                        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                        Instant reqEnd = Instant.now();

                        long responseTime = Duration.between(reqStart, reqEnd).toMillis();

                        synchronized (metrics) {
                            if (response.statusCode() == 200) {
                                metrics.successCount++;
                                metrics.totalResponseTime += responseTime;
                                if (responseTime > metrics.maxResponseTime) {
                                    metrics.maxResponseTime = responseTime;
                                }
                            } else {
                                metrics.errorCount++;
                            }
                        }

                    } catch (Exception e) {
                        synchronized (metrics) {
                            metrics.errorCount++;
                            metrics.timeoutCount++;
                        }
                    }
                });

            } catch (InterruptedException e) {
                break;
            }
        }

        try {
            completionLatch.await();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        scheduler.shutdown();
        metrics.duration = Duration.between(testStart, Instant.now());
        metrics.calculateStats();

        System.out.printf("📊 Results: %,d requests, %,d success, %,d errors, %,d timeouts%n",
                metrics.getTotalRequests(), metrics.successCount, metrics.errorCount, metrics.timeoutCount);
        System.out.printf("⏱️ Avg Response: %.2f ms, Max: %d ms%n",
                metrics.avgResponseTime, metrics.maxResponseTime);
    }

    private static void runSpikeLoadTest() {
        System.out.println("\n⚡ SPIKE LOAD TEST (Sudden traffic spikes)");
        System.out.println("----------------------------------------");

        TestMetrics metrics = new TestMetrics("Spike Load");
        testResults.put("spike", metrics);

        Instant testStart = Instant.now();

        // Simulate traffic spikes: normal -> spike -> normal -> spike
        int[] spikeLevels = {5, 50, 5, 100, 5, 30}; // concurrent users

        for (int spikeLevel : spikeLevels) {
            System.out.printf("🚀 Spike to %d concurrent users...%n", spikeLevel);

            Instant spikeStart = Instant.now();
            ExecutorService spikeExecutor = Executors.newFixedThreadPool(spikeLevel);

            CountDownLatch spikeLatch = new CountDownLatch(spikeLevel * 10); // 10 requests per user

            for (int i = 0; i < spikeLevel * 10; i++) {
                spikeExecutor.submit(() -> {
                    try {
                        String endpoint = getRandomEndpoint();
                        HttpRequest request = HttpRequest.newBuilder()
                                .uri(URI.create(BASE_URL + endpoint))
                                .GET()
                                .timeout(Duration.ofSeconds(15))
                                .build();

                        Instant reqStart = Instant.now();
                        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                        Instant reqEnd = Instant.now();

                        long responseTime = Duration.between(reqStart, reqEnd).toMillis();

                        synchronized (metrics) {
                            if (response.statusCode() == 200) {
                                metrics.successCount++;
                                metrics.totalResponseTime += responseTime;
                                if (responseTime > metrics.maxResponseTime) {
                                    metrics.maxResponseTime = responseTime;
                                }
                            } else {
                                metrics.errorCount++;
                            }
                        }

                    } catch (Exception e) {
                        synchronized (metrics) {
                            metrics.errorCount++;
                            metrics.timeoutCount++;
                        }
                    } finally {
                        spikeLatch.countDown();
                    }
                });
            }

            try {
                spikeLatch.await();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            spikeExecutor.shutdown();
            try {
                spikeExecutor.awaitTermination(30, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                spikeExecutor.shutdownNow();
            }

            Duration spikeDuration = Duration.between(spikeStart, Instant.now());
            System.out.printf("✅ Spike completed in %d seconds%n", spikeDuration.getSeconds());

            // Brief pause between spikes
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        metrics.duration = Duration.between(testStart, Instant.now());
        metrics.calculateStats();
    }

    private static void runMemoryLeakTest() {
        System.out.println("\n💧 MEMORY LEAK TEST (Repeated large requests)");
        System.out.println("---------------------------------------------");

        TestMetrics metrics = new TestMetrics("Memory Leak");
        testResults.put("memory", metrics);

        Instant testStart = Instant.now();
        ExecutorService executor = Executors.newFixedThreadPool(8);

        // Make repeated large requests to test memory handling
        for (int i = 0; i < 500; i++) {
            executor.submit(() -> {
                try {
                    // Request that returns potentially large data
                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create(BASE_URL + "/api/songs"))
                            .GET()
                            .timeout(Duration.ofSeconds(20))
                            .build();

                    Instant reqStart = Instant.now();
                    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                    Instant reqEnd = Instant.now();

                    long responseTime = Duration.between(reqStart, reqEnd).toMillis();

                    synchronized (metrics) {
                        if (response.statusCode() == 200) {
                            metrics.successCount++;
                            metrics.totalResponseTime += responseTime;
                            if (responseTime > metrics.maxResponseTime) {
                                metrics.maxResponseTime = responseTime;
                            }
                        } else {
                            metrics.errorCount++;
                        }
                    }

                } catch (Exception e) {
                    synchronized (metrics) {
                    metrics.errorCount++;
                    metrics.timeoutCount++;
                    }
                }
            });

            // Small delay to avoid overwhelming
            try {
                Thread.sleep(50);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        executor.shutdown();
        try {
            executor.awaitTermination(5, TimeUnit.MINUTES);
        } catch (InterruptedException e) {
            executor.shutdownNow();
        }

        metrics.duration = Duration.between(testStart, Instant.now());
        metrics.calculateStats();

        System.out.printf("📊 Memory test: %,d requests completed%n", metrics.getTotalRequests());
    }

    private static void runTimeoutTest() {
        System.out.println("\n⏰ TIMEOUT TEST (Slow requests handling)");
        System.out.println("--------------------------------------");

        TestMetrics metrics = new TestMetrics("Timeout");
        testResults.put("timeout", metrics);

        Instant testStart = Instant.now();
        ExecutorService executor = Executors.newFixedThreadPool(5);

        // Test with very short timeouts to force failures
        for (int i = 0; i < 100; i++) {
            executor.submit(() -> {
                try {
                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create(BASE_URL + "/api/songs"))
                            .GET()
                            .timeout(Duration.ofMillis(1)) // Very short timeout
                            .build();

                    Instant reqStart = Instant.now();
                    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                    Instant reqEnd = Instant.now();

                    long responseTime = Duration.between(reqStart, reqEnd).toMillis();

                    synchronized (metrics) {
                        if (response.statusCode() == 200) {
                            metrics.successCount++;
                            metrics.totalResponseTime += responseTime;
                        } else {
                            metrics.errorCount++;
                        }
                    }

                } catch (Exception e) {
                    synchronized (metrics) {
                        metrics.errorCount++;
                        metrics.timeoutCount++;
                    }
                }
            });
        }

        executor.shutdown();
        try {
            executor.awaitTermination(2, TimeUnit.MINUTES);
        } catch (InterruptedException e) {
            executor.shutdownNow();
        }

        metrics.duration = Duration.between(testStart, Instant.now());
        metrics.calculateStats();

        System.out.printf("📊 Timeout test: %,d timeouts expected%n", metrics.timeoutCount);
    }

    private static String getRandomEndpoint() {
        String[] endpoints = {
            "/actuator/health",
            "/api/songs",
            "/api/songs/search?query=test",
            "/api/songs/search?query=music",
            "/api/songs/search?query=love"
        };
        return endpoints[ThreadLocalRandom.current().nextInt(endpoints.length)];
    }

    private static void printResults() {
        System.out.println("\n📈 STRESS TEST RESULTS SUMMARY");
        System.out.println("==============================");

        for (Map.Entry<String, TestMetrics> entry : testResults.entrySet()) {
            TestMetrics metrics = entry.getValue();
            System.out.printf("\n🔍 %s Test:%n", metrics.testName);
            System.out.printf("   Duration: %d seconds%n", metrics.duration.getSeconds());
            System.out.printf("   Total Requests: %,d%n", metrics.getTotalRequests());
            System.out.printf("   Success Rate: %.2f%%%n", metrics.getSuccessRate());
            System.out.printf("   Average Response Time: %.2f ms%n", metrics.avgResponseTime);
            System.out.printf("   Max Response Time: %d ms%n", metrics.maxResponseTime);
            System.out.printf("   Errors: %,d%n", metrics.errorCount);
            System.out.printf("   Timeouts: %,d%n", metrics.timeoutCount);

            // Performance assessment
            if (metrics.getSuccessRate() > 95 && metrics.avgResponseTime < 500) {
                System.out.println("   ✅ EXCELLENT: System handles stress well");
            } else if (metrics.getSuccessRate() > 90 && metrics.avgResponseTime < 1000) {
                System.out.println("   👍 GOOD: System performs adequately under stress");
            } else {
                System.out.println("   ⚠️ NEEDS IMPROVEMENT: System struggles under stress");
            }
        }
    }

    static class TestMetrics {
        final String testName;
        int successCount = 0;
        int errorCount = 0;
        int timeoutCount = 0;
        long totalResponseTime = 0;
        long maxResponseTime = 0;
        Duration duration;
        double avgResponseTime = 0;

        TestMetrics(String testName) {
            this.testName = testName;
        }

        int getTotalRequests() {
            return successCount + errorCount;
        }

        double getSuccessRate() {
            int total = getTotalRequests();
            return total > 0 ? (double) successCount / total * 100 : 0;
        }

        void calculateStats() {
            if (successCount > 0) {
                avgResponseTime = (double) totalResponseTime / successCount;
            }
        }
    }
}