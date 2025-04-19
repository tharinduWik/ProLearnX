package com.example.prolearnx.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * This configuration is disabled to avoid bean conflicts with MongoConfig
 */
@Configuration
@Profile("unused") // This ensures this configuration is never loaded
public class MongoClientConfig {
    // All configuration moved to MongoConfig.java
}
