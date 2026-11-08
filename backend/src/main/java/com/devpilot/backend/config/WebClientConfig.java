package com.devpilot.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

@Configuration
public class WebClientConfig {
    
    
        
        @Bean
        HttpClient largeHeaderHttpClient() {
            return HttpClient.create()
                    .httpResponseDecoder(spec -> spec
                            .maxHeaderSize(64 * 1024)
                            .maxInitialLineLength(16 * 1024)
                    );
        }
        
        @Bean
        @Primary
        WebClient.Builder webClientBuilder(HttpClient largeHeaderHttpClient) {
            return WebClient.builder()
                    .clientConnector(new ReactorClientHttpConnector(largeHeaderHttpClient));
        }
    
}