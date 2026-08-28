package com.mplace.backend.integration.onec.dto;

import java.math.BigDecimal;

public record OneCPriceDto(
        String sku,
        BigDecimal price
) {
}
