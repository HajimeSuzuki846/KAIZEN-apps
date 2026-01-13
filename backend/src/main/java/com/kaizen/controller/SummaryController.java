package com.kaizen.controller;

import com.kaizen.model.ImprovementCase;
import com.kaizen.repository.ImprovementCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/summary")
@CrossOrigin(origins = "*")
public class SummaryController {

    @Autowired
    private ImprovementCaseRepository caseRepository;

    @GetMapping("/top-views")
    public ResponseEntity<List<Map<String, Object>>> getTopViewedCases() {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfMonth = LocalDateTime.now();
        
        List<ImprovementCase> topCases = caseRepository.findTopViewedByMonth(startOfMonth, endOfMonth);
        List<Map<String, Object>> result = topCases.stream()
            .limit(10)
            .map(c -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("title", c.getTitle());
                map.put("viewCount", c.getViewCount());
                map.put("likeCount", c.getLikeCount());
                map.put("commentCount", c.getCommentCount());
                map.put("factoryName", c.getFactory().getName());
                map.put("departmentName", c.getDepartment().getName());
                return map;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCases", caseRepository.count());
        // その他の統計情報を追加可能
        return ResponseEntity.ok(stats);
    }
}

