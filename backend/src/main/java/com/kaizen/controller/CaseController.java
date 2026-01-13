package com.kaizen.controller;

import com.kaizen.model.*;
import com.kaizen.repository.*;
import com.kaizen.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cases")
@CrossOrigin(origins = "*")
public class CaseController {

    @Autowired
    private ImprovementCaseRepository caseRepository;

    @Autowired
    private CaseImageRepository imageRepository;

    @Autowired
    private FactoryRepository factoryRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ViewLogRepository viewLogRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllCases(
            @RequestParam(required = false) Long factoryId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sortBy) {
        
        List<ImprovementCase> cases;
        
        if (keyword != null && !keyword.isEmpty()) {
            cases = caseRepository.searchByKeyword(keyword);
        } else if (factoryId != null && departmentId != null) {
            cases = caseRepository.findByFactoryIdAndDepartmentId(factoryId, departmentId);
        } else if (factoryId != null) {
            cases = caseRepository.findByFactoryId(factoryId);
        } else if (departmentId != null) {
            cases = caseRepository.findByDepartmentId(departmentId);
        } else {
            cases = caseRepository.findAll();
        }
        
        if ("likes".equals(sortBy)) {
            cases.sort((a, b) -> b.getLikeCount().compareTo(a.getLikeCount()));
        } else if ("views".equals(sortBy)) {
            cases.sort((a, b) -> b.getViewCount().compareTo(a.getViewCount()));
        } else {
            cases.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        }
        
        return ResponseEntity.ok(cases.stream().map(this::caseToMap).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCase(@PathVariable Long id, @RequestParam(required = false) Long userId) {
        Optional<ImprovementCase> caseOpt = caseRepository.findById(id);
        if (caseOpt.isPresent()) {
            ImprovementCase improvementCase = caseOpt.get();
            
            // 閲覧数カウント
            if (userId != null) {
                LocalDate today = LocalDate.now();
                Optional<ViewLog> logOpt = viewLogRepository.findByImprovementCaseIdAndUserIdAndViewedDate(id, userId, today);
                if (logOpt.isEmpty()) {
                    ViewLog viewLog = new ViewLog();
                    viewLog.setImprovementCase(improvementCase);
                    viewLog.setUser(userRepository.findById(userId).orElse(null));
                    viewLog.setViewedDate(today);
                    viewLogRepository.save(viewLog);
                    
                    improvementCase.setViewCount(improvementCase.getViewCount() + 1);
                    caseRepository.save(improvementCase);
                }
            }
            
            return ResponseEntity.ok(caseToMap(improvementCase));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createCase(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam Long factoryId,
            @RequestParam Long departmentId,
            @RequestParam Long userId,
            @RequestParam("images") MultipartFile[] images) {
        
        try {
            ImprovementCase improvementCase = new ImprovementCase();
            improvementCase.setTitle(title);
            improvementCase.setDescription(description);
            improvementCase.setFactory(factoryRepository.findById(factoryId).orElseThrow());
            improvementCase.setDepartment(departmentRepository.findById(departmentId).orElseThrow());
            improvementCase.setUser(userRepository.findById(userId).orElseThrow());
            
            ImprovementCase savedCase = caseRepository.save(improvementCase);
            
            // 画像の保存
            List<CaseImage> caseImages = new ArrayList<>();
            for (int i = 0; i < images.length && i < 10; i++) {
                String imagePath = fileStorageService.storeFile(images[i]);
                CaseImage caseImage = new CaseImage();
                caseImage.setImprovementCase(savedCase);
                caseImage.setImagePath(imagePath);
                caseImage.setImageOrder(i);
                caseImages.add(imageRepository.save(caseImage));
            }
            
            return ResponseEntity.ok(caseToMap(savedCase));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateCase(
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long factoryId,
            @RequestParam(required = false) Long departmentId) {
        
        Optional<ImprovementCase> caseOpt = caseRepository.findById(id);
        if (caseOpt.isPresent()) {
            ImprovementCase improvementCase = caseOpt.get();
            if (title != null) improvementCase.setTitle(title);
            if (description != null) improvementCase.setDescription(description);
            if (factoryId != null) improvementCase.setFactory(factoryRepository.findById(factoryId).orElseThrow());
            if (departmentId != null) improvementCase.setDepartment(departmentRepository.findById(departmentId).orElseThrow());
            
            return ResponseEntity.ok(caseToMap(caseRepository.save(improvementCase)));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCase(@PathVariable Long id) {
        if (caseRepository.existsById(id)) {
            caseRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable Long id, @RequestParam Long userId) {
        Optional<Like> likeOpt = likeRepository.findByImprovementCaseIdAndUserId(id, userId);
        ImprovementCase improvementCase = caseRepository.findById(id).orElseThrow();
        
        if (likeOpt.isPresent()) {
            likeRepository.delete(likeOpt.get());
            improvementCase.setLikeCount(Math.max(0, improvementCase.getLikeCount() - 1));
        } else {
            Like like = new Like();
            like.setImprovementCase(improvementCase);
            like.setUser(userRepository.findById(userId).orElseThrow());
            likeRepository.save(like);
            improvementCase.setLikeCount(improvementCase.getLikeCount() + 1);
        }
        caseRepository.save(improvementCase);
        return ResponseEntity.ok(Map.of("likeCount", improvementCase.getLikeCount()));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<Map<String, Object>>> getComments(@PathVariable Long id) {
        List<Comment> comments = commentRepository.findByImprovementCaseIdOrderByCreatedAtAsc(id);
        return ResponseEntity.ok(comments.stream().map(comment -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", comment.getId());
            map.put("content", comment.getContent());
            map.put("userId", comment.getUser().getId());
            map.put("username", comment.getUser().getUsername());
            map.put("createdAt", comment.getCreatedAt());
            return map;
        }).collect(Collectors.toList()));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Map<String, Object>> addComment(
            @PathVariable Long id,
            @RequestParam String content,
            @RequestParam Long userId) {
        
        Comment comment = new Comment();
        comment.setImprovementCase(caseRepository.findById(id).orElseThrow());
        comment.setUser(userRepository.findById(userId).orElseThrow());
        comment.setContent(content);
        Comment savedComment = commentRepository.save(comment);
        
        ImprovementCase improvementCase = caseRepository.findById(id).orElseThrow();
        improvementCase.setCommentCount(commentRepository.countByImprovementCaseId(id));
        caseRepository.save(improvementCase);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedComment.getId());
        response.put("content", savedComment.getContent());
        response.put("userId", savedComment.getUser().getId());
        response.put("username", savedComment.getUser().getUsername());
        response.put("createdAt", savedComment.getCreatedAt());
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> caseToMap(ImprovementCase improvementCase) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", improvementCase.getId());
        map.put("title", improvementCase.getTitle());
        map.put("description", improvementCase.getDescription());
        map.put("factoryId", improvementCase.getFactory().getId());
        map.put("factoryName", improvementCase.getFactory().getName());
        map.put("departmentId", improvementCase.getDepartment().getId());
        map.put("departmentName", improvementCase.getDepartment().getName());
        map.put("userId", improvementCase.getUser().getId());
        map.put("username", improvementCase.getUser().getUsername());
        map.put("viewCount", improvementCase.getViewCount());
        map.put("likeCount", improvementCase.getLikeCount());
        map.put("commentCount", improvementCase.getCommentCount());
        map.put("createdAt", improvementCase.getCreatedAt());
        map.put("updatedAt", improvementCase.getUpdatedAt());
        
        List<CaseImage> images = imageRepository.findByImprovementCaseIdOrderByImageOrderAsc(improvementCase.getId());
        map.put("images", images.stream().map(CaseImage::getImagePath).collect(Collectors.toList()));
        
        return map;
    }
}

