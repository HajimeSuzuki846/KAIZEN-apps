package com.kaizen.repository;

import com.kaizen.model.ImprovementCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ImprovementCaseRepository extends JpaRepository<ImprovementCase, Long> {
    List<ImprovementCase> findByFactoryId(Long factoryId);
    List<ImprovementCase> findByDepartmentId(Long departmentId);
    List<ImprovementCase> findByFactoryIdAndDepartmentId(Long factoryId, Long departmentId);
    
    @Query("SELECT c FROM ImprovementCase c WHERE c.title LIKE %:keyword% OR c.description LIKE %:keyword%")
    List<ImprovementCase> searchByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT c FROM ImprovementCase c WHERE c.createdAt BETWEEN :startDate AND :endDate ORDER BY c.viewCount DESC")
    List<ImprovementCase> findTopViewedByMonth(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}

