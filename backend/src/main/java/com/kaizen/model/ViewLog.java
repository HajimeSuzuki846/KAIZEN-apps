package com.kaizen.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "view_logs", uniqueConstraints = @UniqueConstraint(columnNames = {"case_id", "user_id", "viewed_date"}))
public class ViewLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "case_id", nullable = false)
    private ImprovementCase improvementCase;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "viewed_date", nullable = false)
    private LocalDate viewedDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (viewedDate == null) {
            viewedDate = LocalDate.now();
        }
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getViewedDate() {
        return viewedDate;
    }

    public void setViewedDate(LocalDate viewedDate) {
        this.viewedDate = viewedDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

