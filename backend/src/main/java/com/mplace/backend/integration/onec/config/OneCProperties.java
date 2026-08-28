package com.mplace.backend.integration.onec.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Binds the onec.* properties from application.yml (base-url, username,
 * password — always sourced from environment variables, never hardcoded).
 * MockOneCClient doesn't use these yet; they're wired up ready for
 * HttpOneCClient.
 */
@Component
@ConfigurationProperties(prefix = "onec")
public class OneCProperties {

    private String baseUrl;
    private String username;
    private String password;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
