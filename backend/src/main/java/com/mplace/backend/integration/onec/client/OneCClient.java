package com.mplace.backend.integration.onec.client;

import com.mplace.backend.integration.onec.dto.OneCOrderExportDto;
import com.mplace.backend.integration.onec.dto.OneCOrderStatusDto;
import com.mplace.backend.integration.onec.dto.OneCPriceDto;
import com.mplace.backend.integration.onec.dto.OneCProductDto;
import com.mplace.backend.integration.onec.dto.OneCStockDto;

import java.util.List;

/**
 * Abstraction over the 1C REST API.
 *
 * OneCIntegrationService (and the rest of the application) depends only on
 * this interface, never on an HTTP implementation. For the MVP,
 * {@link MockOneCClient} is the active implementation. Once the real 1C
 * endpoints are known, an HttpOneCClient can be plugged in here without
 * touching ProductService, OrderService, or OneCIntegrationService.
 */
public interface OneCClient {

    List<OneCProductDto> fetchProducts();

    List<OneCPriceDto> fetchPrices();

    List<OneCStockDto> fetchStocks();

    void sendOrder(OneCOrderExportDto order);

    List<OneCOrderStatusDto> fetchOrderStatuses();
}
