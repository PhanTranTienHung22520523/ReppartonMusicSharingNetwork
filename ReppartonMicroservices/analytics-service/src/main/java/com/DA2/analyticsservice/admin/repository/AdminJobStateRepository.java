package com.DA2.analyticsservice.admin.repository;

import com.DA2.analyticsservice.admin.entity.AdminJobState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminJobStateRepository extends JpaRepository<AdminJobState, String> {
}
