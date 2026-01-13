package com.kaizen.controller;

import com.kaizen.model.Factory;
import com.kaizen.repository.FactoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/factories")
@CrossOrigin(origins = "*")
public class FactoryController {

    @Autowired
    private FactoryRepository factoryRepository;

    @GetMapping
    public ResponseEntity<List<Factory>> getAllFactories() {
        return ResponseEntity.ok(factoryRepository.findAll());
    }
}

