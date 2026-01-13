package com.kaizen.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "case_images")
public class CaseImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "case_id", nullable = false)
    private ImprovementCase improvementCase;

    @Column(name = "image_path", nullable = false, length = 500)
    private String imagePath;

    @Column(name = "image_order")
    private Integer imageOrder = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ImprovementCase getImprovementCase() {
        return improvementCase;
    }

    public void setImprovementCase(ImprovementCase improvementCase) {
        this.improvementCase = improvementCase;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public Integer getImageOrder() {
        return imageOrder;
    }

    public void setImageOrder(Integer imageOrder) {
        this.imageOrder = imageOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

