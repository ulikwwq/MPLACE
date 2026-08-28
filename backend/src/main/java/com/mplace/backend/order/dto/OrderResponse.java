package com.mplace.backend.order.dto;

import com.mplace.backend.order.entity.Order;

import java.math.BigDecimal;
import java.util.List;

public record OrderResponse(
        Long id,
        String status,
        String customerName,
        String customerPhone,
        BigDecimal totalPrice,
        List<OrderItemResponse> items
) {

    public static OrderResponse from(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(OrderItemResponse::from)
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getStatus().name(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getTotalPrice(),
                itemResponses
        );
    }
}
