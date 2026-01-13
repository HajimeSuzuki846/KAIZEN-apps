package com.kaizen.controller;

import com.kaizen.model.Department;
import com.kaizen.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "*")
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<List<Department>> getDepartments(@RequestParam(required = false) Long factoryId) {
        if (factoryId != null) {
            return ResponseEntity.ok(departmentRepository.findByFactoryId(factoryId));
        }
        return ResponseEntity.ok(departmentRepository.findAll());
    }
}

