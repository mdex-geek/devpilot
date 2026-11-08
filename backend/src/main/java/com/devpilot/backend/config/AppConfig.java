package com.devpilot.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AppConfig {
    
    
    
    @Bean(name = "indexingExecutor")
    public Executor indexingExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
         executor.setQueueCapacity(50);
         executor.setThreadNamePrefix("index-");
         executor.initialize();
         return executor;
    }
}
