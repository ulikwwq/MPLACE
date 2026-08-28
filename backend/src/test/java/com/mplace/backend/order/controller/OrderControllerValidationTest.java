package com.mplace.backend.order.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mplace.backend.order.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
class OrderControllerValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private OrderService orderService;

    @Test
    void createOrder_missingCustomerName_returns400WithFieldError() throws Exception {
        String body = """
                {
                  "customerName": "",
                  "customerPhone": "+996700000000",
                  "items": [{"productId": 1, "quantity": 1}]
                }
                """;

        mockMvc.perform(post("/api/orders")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.customerName").exists());
    }

    @Test
    void createOrder_invalidPhone_returns400WithFieldError() throws Exception {
        String body = """
                {
                  "customerName": "Test Customer",
                  "customerPhone": "not-a-phone!!",
                  "items": [{"productId": 1, "quantity": 1}]
                }
                """;

        mockMvc.perform(post("/api/orders")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.customerPhone").exists());
    }

    @Test
    void createOrder_zeroQuantity_returns400WithNestedFieldError() throws Exception {
        String body = """
                {
                  "customerName": "Test Customer",
                  "customerPhone": "+996700000000",
                  "items": [{"productId": 1, "quantity": 0}]
                }
                """;

        mockMvc.perform(post("/api/orders")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    @Test
    void createOrder_malformedJson_returns400WithMalformedRequestBodyError() throws Exception {
        mockMvc.perform(post("/api/orders")
                        .contentType("application/json")
                        .content("{ not valid json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("MALFORMED_REQUEST_BODY"));
    }

    @Test
    void getOrder_nonNumericId_returns400WithInvalidParameterError() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/orders/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_PARAMETER"));
    }
}
