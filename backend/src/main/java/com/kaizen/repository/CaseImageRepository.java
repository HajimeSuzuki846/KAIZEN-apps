package com.kaizen.repository;

import com.kaizen.model.CaseImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CaseImageRepository extends JpaRepository<CaseImage, Long> {
    List<CaseImage> findByImprovementCaseIdOrderByImageOrderAsc(Long caseId);
}

