package com.devpilot.backend.service.ai;

import com.devpilot.backend.dto.CitationDto;

import java.util.List;


public record RetrievedContext(
        List<CitationDto> citations,
        String contextText) {
}
