package com.devpilot.backend.controller;

import com.devpilot.backend.Entity.Repository;
import com.devpilot.backend.dto.IndexStatusResponse;
import com.devpilot.backend.dto.RepositoryResponse;
import com.devpilot.backend.security.CurrentUser;
import com.devpilot.backend.service.RepoService;
import com.devpilot.backend.service.indexing.IndexingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/repos")
@RequiredArgsConstructor
public class RepoController {
    private final CurrentUser currentUser;
    private final RepoService repoService;
    private final IndexingService indexingService;
    
    @GetMapping
    public List<RepositoryResponse> list(
            @RequestParam(name = "refresh",defaultValue = "true") boolean refresh
    ){
        UUID userID = currentUser.require().getId();
        if (refresh){
            return repoService.syncAndListRepos(userID);
            
        }
        return repoService.listStored(userID);
    }
    
    @GetMapping("/{id}")
    public RepositoryResponse get(@PathVariable UUID id) {
        UUID userID = currentUser.require().getId();
        return repoService.toResponse(repoService.requireOwned(id, userID));
    }
    
    @GetMapping("/{id}/status")
    public IndexStatusResponse status(@PathVariable UUID id) {
        UUID userId = currentUser.require().getId();
        return repoService.status(id, userId);
    }
    
    @PostMapping("/{id}/index")
    public ResponseEntity<RepositoryResponse> index(@PathVariable UUID id) {
        UUID userId = currentUser.require().getId();
        Repository repo = indexingService.startIndexing(id, userId);
        indexingService.indexAsync(id,userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(repoService.toResponse(repo));
    }
}
