package com.kaizen.repository;

import com.kaizen.model.ViewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ViewLogRepository extends JpaRepository<ViewLog, Long> {
    Optional<ViewLog> findByImprovementCaseIdAndUserIdAndViewedDate(Long caseId, Long userId, LocalDate viewedDate);
}

