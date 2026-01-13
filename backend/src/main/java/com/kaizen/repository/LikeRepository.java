package com.kaizen.repository;

import com.kaizen.model.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByImprovementCaseIdAndUserId(Long caseId, Long userId);
    boolean existsByImprovementCaseIdAndUserId(Long caseId, Long userId);
    long countByImprovementCaseId(Long caseId);
}

