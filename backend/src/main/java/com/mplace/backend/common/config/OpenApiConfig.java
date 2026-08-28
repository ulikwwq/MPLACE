package com.mplace.backend.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI mplaceOpenApi() {
        return new OpenAPI().info(new Info()
                .title("MPlace Marketplace API")
                .description("Backend API for the MPlace MVP: products, orders, and 1C integration.")
                .version("v0.1 (MVP)"));
    }
}
