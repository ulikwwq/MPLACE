package com.mplace.backend.integration.onec.dto;

/**
 * An order status update as reported by 1C.
 * {@code status} is expected to match one of MPlace's OrderStatus enum
 * values (NEW, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED).
 */
public record OneCOrderStatusDto(
        Long orderId,
        String status
) {
}
