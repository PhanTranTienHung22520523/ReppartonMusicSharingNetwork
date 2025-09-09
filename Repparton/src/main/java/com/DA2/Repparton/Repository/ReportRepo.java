package com.DA2.Repparton.Repository;

import com.DA2.Repparton.Entity.Report;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReportRepo extends MongoRepository<Report, String> {
    List<Report> findByStatus(String status);
    List<Report> findByItemIdAndItemType(String itemId, String itemType);
}

