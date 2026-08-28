package com.mplace.backend.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record OrderRequest(

        @NotBlank(message = "customerName is required")
        @Size(max = 255, message = "customerName must be at most 255 characters")
        String customerName,

        @NotBlank(message = "customerPhone is required")
        @Pattern(
                regexp = "^\\+?[0-9][0-9\\-\\s]{6,19}$",
                message = "customerPhone must be a valid phone number"
        )
        String customerPhone,

        @NotEmpty(message = "order must contain at least one item")
        @Valid
        List<OrderItemRequest> items
) {
}
