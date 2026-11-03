package com.faceattend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${ai-service.url}")
    private String aiServiceUrl;

    @Value("${ai-service.api-key}")
    private String aiApiKey;

    @Bean
    public WebClient aiWebClient() {
        return WebClient.builder()
                .baseUrl(aiServiceUrl)
                .defaultHeader("X-API-Key", aiApiKey)
                .build();
    }
}
