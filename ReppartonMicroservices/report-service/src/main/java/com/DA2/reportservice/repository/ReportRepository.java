package com.DA2.reportservice.repository;

import com.DA2.reportservice.entity.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends MongoRepository<Report, String> {
    
    // Find reports by status
    Page<Report> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    List<Report> findByStatus(String status);
    
    // Find reports by reporter
    List<Report> findByReporterIdOrderByCreatedAtDesc(String reporterId);
    
    // Find reports by item
    List<Report> findByItemIdAndItemType(String itemId, String itemType);
    
    // Find reports by item type
    Page<Report> findByItemTypeOrderByCreatedAtDesc(String itemType, Pageable pageable);
    
    // Count reports by status
    long countByStatus(String status);
    
    // Count reports for specific item
    long countByItemIdAndItemType(String itemId, String itemType);
    
    // Check if user already reported item
    boolean existsByReporterIdAndItemIdAndItemType(String reporterId, String itemId, String itemType);
}
