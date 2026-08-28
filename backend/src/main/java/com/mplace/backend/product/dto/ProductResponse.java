package com.mplace.backend.product.dto;

import com.mplace.backend.product.entity.Product;

import java.math.BigDecimal;

/**
 * Read-only representation of a Product returned by the API.
 * Never exposes the JPA entity directly.
 */
public record ProductResponse(
        Long id,
        String sku,
        String name,
        String description,
        BigDecimal price,
        Integer stockQuantity,
        String status,
        Long categoryId
) {

    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getStatus().name(),
                product.getCategory().getId()
        );
    }
}
