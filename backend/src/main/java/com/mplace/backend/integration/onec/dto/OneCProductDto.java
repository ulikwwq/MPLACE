package com.mplace.backend.integration.onec.dto;

/**
 * A product catalog record as received from 1C.
 * Price and stock are intentionally absent — 1C syncs those separately
 * (see {@link OneCPriceDto}, {@link OneCStockDto}).
 */
public record OneCProductDto(
        String sku,
        String name,
        String description,
        String categoryName
) {
}
