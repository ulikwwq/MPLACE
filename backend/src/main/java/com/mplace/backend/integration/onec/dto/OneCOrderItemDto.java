package com.mplace.backend.integration.onec.dto;

import java.math.BigDecimal;

public record OneCOrderItemDto(
        String sku,
        Integer quantity,
        BigDecimal unitPrice
) {
}
