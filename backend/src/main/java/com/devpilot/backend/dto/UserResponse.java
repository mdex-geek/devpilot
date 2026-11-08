package com.devpilot.backend.dto;

import lombok.Value;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public record UserResponse (
        UUID id,
long githubId, String githubUsername, String displayName, String avatarUrl) {

}