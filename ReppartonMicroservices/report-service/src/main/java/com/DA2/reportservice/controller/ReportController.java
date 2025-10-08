package com.DA2.reportservice.controller;

import com.DA2.reportservice.entity.Report;
import com.DA2.reportservice.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Report Service is running");
    }

    // Create report
    @PostMapping
    public ResponseEntity<?> createReport(@RequestBody Report report) {
        try {
            Report created = reportService.createReport(report);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Report submitted successfully",
                "report", created
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Get report by ID
    @GetMapping("/{reportId}")
    public ResponseEntity<?> getReport(@PathVariable String reportId) {
        try {
            Report report = reportService.getReportById(reportId)
                    .orElseThrow(() -> new RuntimeException("Report not found"));
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get all reports (admin)
    @GetMapping
    public ResponseEntity<?> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Report> reports = reportService.getAllReports(pageable);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get reports by status
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getReportsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Report> reports = reportService.getReportsByStatus(status, pageable);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get reports by reporter
    @GetMapping("/reporter/{reporterId}")
    public ResponseEntity<?> getReportsByReporter(@PathVariable String reporterId) {
        try {
            List<Report> reports = reportService.getReportsByReporter(reporterId);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get reports for specific item
    @GetMapping("/item")
    public ResponseEntity<?> getReportsForItem(
            @RequestParam String itemId,
            @RequestParam String itemType) {
        try {
            List<Report> reports = reportService.getReportsForItem(itemId, itemType);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get reports by item type
    @GetMapping("/type/{itemType}")
    public ResponseEntity<?> getReportsByItemType(
            @PathVariable String itemType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Report> reports = reportService.getReportsByItemType(itemType, pageable);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Update report status (admin)
    @PutMapping("/{reportId}/status")
    public ResponseEntity<?> updateReportStatus(
            @PathVariable String reportId,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            String reviewedBy = request.get("reviewedBy");
            String resolution = request.get("resolution");
            
            Report updated = reportService.updateReportStatus(reportId, status, reviewedBy, resolution);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Report status updated successfully",
                "report", updated
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Get statistics (admin)
    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics() {
        try {
            ReportService.ReportStatistics stats = reportService.getStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get report count for item
    @GetMapping("/count")
    public ResponseEntity<?> getReportCountForItem(
            @RequestParam String itemId,
            @RequestParam String itemType) {
        try {
            long count = reportService.getReportCountForItem(itemId, itemType);
            return ResponseEntity.ok(Map.of(
                "itemId", itemId,
                "itemType", itemType,
                "reportCount", count
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Delete report (admin)
    @DeleteMapping("/{reportId}")
    public ResponseEntity<?> deleteReport(@PathVariable String reportId) {
        try {
            reportService.deleteReport(reportId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Report deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}
