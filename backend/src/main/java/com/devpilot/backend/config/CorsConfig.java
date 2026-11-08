package com.devpilot.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {
    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value ("${app.cors.allowed-origin}") String allowedOrigin) {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> allowedOrigins =
                Arrays.stream(allowedOrigin.
                                split(",")).
                        map(String::trim).
                        filter(s -> !s.isEmpty()).
                        toList();
        
        configuration.setAllowedOrigins(allowedOrigins);
        
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    
}
