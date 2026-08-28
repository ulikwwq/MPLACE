package com.mplace.backend.integration.onec.dto;

import java.math.BigDecimal;
import java.util.List;

public record OneCOrderExportDto(
        Long orderId,
        String customerName,
        String customerPhone,
        String status,
        BigDecimal totalPrice,
        List<OneCOrderItemDto> items
) {
}
