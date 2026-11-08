package com.devpilot.backend.dto;

import com.devpilot.backend.Entity.IndexStatus;

import java.time.Instant;
import java.util.UUID;

public record IndexStatusResponse(
        UUID repositoryId,
        IndexStatus indexStatus,
        int filesTotal,
        int filesProcessed,
        int chunkCount,
        Instant indexedAt,
        String errorMessage) {
}