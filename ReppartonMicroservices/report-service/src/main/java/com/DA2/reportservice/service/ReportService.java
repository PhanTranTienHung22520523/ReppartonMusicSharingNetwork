package com.DA2.reportservice.service;

import com.DA2.reportservice.entity.Report;
import com.DA2.reportservice.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    // Create report
    @Transactional
    public Report createReport(Report report) {
        // Validate
        if (report.getReporterId() == null || report.getItemId() == null || 
            report.getItemType() == null || report.getReason() == null) {
            throw new RuntimeException("Missing required fields");
        }

        // Check if user already reported this item
        boolean alreadyReported = reportRepository.existsByReporterIdAndItemIdAndItemType(
            report.getReporterId(), report.getItemId(), report.getItemType()
        );
        
        if (alreadyReported) {
            throw new RuntimeException("You have already reported this item");
        }

        report.setCreatedAt(LocalDateTime.now());
        report.setStatus("pending");
        return reportRepository.save(report);
    }

    // Get report by ID
    public Optional<Report> getReportById(String reportId) {
        return reportRepository.findById(reportId);
    }

    // Get all reports with pagination
    public Page<Report> getAllReports(Pageable pageable) {
        return reportRepository.findAll(pageable);
    }

    // Get reports by status
    public Page<Report> getReportsByStatus(String status, Pageable pageable) {
        return reportRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc(status, pageable);
    }

    // Get reports by reporter
    public List<Report> getReportsByReporter(String reporterId) {
        return reportRepository.findByReporterIdOrderByCreatedAtDesc(reporterId);
    }

    // Get reports for specific item
    public List<Report> getReportsForItem(String itemId, String itemType) {
        return reportRepository.findByItemIdAndItemType(itemId, itemType);
    }

    // Get reports by item type
    public Page<Report> getReportsByItemType(String itemType, Pageable pageable) {
        return reportRepository.findByItemTypeOrderByCreatedAtDesc(itemType, pageable);
    }

    // Update report status (admin action)
    @Transactional
    public Report updateReportStatus(String reportId, String status, String reviewedBy, String resolution) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setStatus(status);
        report.setReviewedBy(reviewedBy);
        report.setResolution(resolution);
        report.setUpdatedAt(LocalDateTime.now());

        return reportRepository.save(report);
    }

    // Get statistics
    public ReportStatistics getStatistics() {
        long totalReports = reportRepository.count();
        long pendingReports = reportRepository.countByStatusIgnoreCase("PENDING");
        long reviewingReports = reportRepository.countByStatusIgnoreCase("REVIEWING");
        long resolvedReports = reportRepository.countByStatusIgnoreCase("RESOLVED");
        long rejectedReports = reportRepository.countByStatusIgnoreCase("REJECTED");

        ReportStatistics stats = new ReportStatistics();
        stats.setTotalReports(totalReports);
        stats.setTotalPending(pendingReports);
        stats.setTotalReviewing(reviewingReports);
        stats.setTotalResolved(resolvedReports);
        stats.setTotalRejected(rejectedReports);

        return stats;
    }

    // Count reports for specific item
    public long getReportCountForItem(String itemId, String itemType) {
        return reportRepository.countByItemIdAndItemType(itemId, itemType);
    }

    // Delete report (admin only)
    @Transactional
    public void deleteReport(String reportId) {
        if (!reportRepository.existsById(reportId)) {
            throw new RuntimeException("Report not found");
        }
        reportRepository.deleteById(reportId);
    }

    // Inner class for statistics
    public static class ReportStatistics {
        private long totalReports;
        private long totalPending;
        private long totalReviewing;
        private long totalResolved;
        private long totalRejected;

        public long getTotalReports() { return totalReports; }
        public void setTotalReports(long totalReports) { this.totalReports = totalReports; }
        public long getTotalPending() { return totalPending; }
        public void setTotalPending(long totalPending) { this.totalPending = totalPending; }
        public long getTotalReviewing() { return totalReviewing; }
        public void setTotalReviewing(long totalReviewing) { this.totalReviewing = totalReviewing; }
        public long getTotalResolved() { return totalResolved; }
        public void setTotalResolved(long totalResolved) { this.totalResolved = totalResolved; }
        public long getTotalRejected() { return totalRejected; }
        public void setTotalRejected(long totalRejected) { this.totalRejected = totalRejected; }
    }
}
