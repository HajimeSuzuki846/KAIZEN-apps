package com.kaizen.repository;

import com.kaizen.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByImprovementCaseIdOrderByCreatedAtAsc(Long caseId);
    long countByImprovementCaseId(Long caseId);
}

