package com.mplace.backend.integration.onec.controller;

import com.mplace.backend.integration.onec.service.OneCIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Manually triggers 1C sync operations. There's no scheduler in the MVP,
 * so this is how the integration module is invoked and verified during
 * development. A real deployment would likely replace/augment this with a
 * scheduled job, but that's future scope (see spec section 24).
 */
@RestController
@RequestMapping("/api/integration/onec")
@Tag(name = "1C Integration", description = "Dev/testing endpoints to manually trigger 1C sync — no scheduler in the MVP")
public class OneCSyncController {

    private final OneCIntegrationService integrationService;

    public OneCSyncController(OneCIntegrationService integrationService) {
        this.integrationService = integrationService;
    }

    @PostMapping("/sync/products")
    @Operation(summary = "Import products from 1C", description = "Creates new products or updates existing ones, matched by SKU.")
    @ApiResponse(responseCode = "200", description = "Sync completed")
    @ApiResponse(responseCode = "502", description = "1C request failed")
    public void syncProducts() {
        integrationService.importProducts();
    }

    @PostMapping("/sync/prices")
    @Operation(summary = "Import prices from 1C")
    @ApiResponse(responseCode = "200", description = "Sync completed")
    @ApiResponse(responseCode = "502", description = "1C request failed")
    public void syncPrices() {
        integrationService.importPrices();
    }

    @PostMapping("/sync/stock")
    @Operation(summary = "Import stock levels from 1C")
    @ApiResponse(responseCode = "200", description = "Sync completed")
    @ApiResponse(responseCode = "502", description = "1C request failed")
    public void syncStock() {
        integrationService.importStock();
    }

    @PostMapping("/export-orders/{orderId}")
    @Operation(summary = "Export an order to 1C")
    @ApiResponse(responseCode = "200", description = "Order exported")
    @ApiResponse(responseCode = "404", description = "Order not found")
    @ApiResponse(responseCode = "502", description = "1C request failed")
    public void exportOrder(@PathVariable Long orderId) {
        integrationService.exportOrder(orderId);
    }

    @PostMapping("/sync/order-statuses")
    @Operation(summary = "Import order status updates from 1C")
    @ApiResponse(responseCode = "200", description = "Sync completed")
    @ApiResponse(responseCode = "502", description = "1C request failed")
    public void syncOrderStatuses() {
        integrationService.importOrderStatuses();
    }
}
