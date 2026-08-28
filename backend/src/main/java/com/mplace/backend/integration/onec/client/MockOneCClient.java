package com.mplace.backend.integration.onec.client;

import com.mplace.backend.integration.onec.dto.OneCOrderExportDto;
import com.mplace.backend.integration.onec.dto.OneCOrderStatusDto;
import com.mplace.backend.integration.onec.dto.OneCPriceDto;
import com.mplace.backend.integration.onec.dto.OneCProductDto;
import com.mplace.backend.integration.onec.dto.OneCStockDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simulates the 1C REST API for local development and testing, since a real
 * 1C server may not be available. Returns a fixed catalog and tracks orders
 * "sent" to it so fetchOrderStatuses() can report something meaningful back.
 *
 * Replace with an HttpOneCClient later — OneCIntegrationService only
 * depends on the OneCClient interface, so no other code needs to change.
 */
@Component
public class MockOneCClient implements OneCClient {

    private static final Logger log = LoggerFactory.getLogger(MockOneCClient.class);

    // orderId -> simulated status reported by 1C
    private final Map<Long, String> sentOrderStatuses = new ConcurrentHashMap<>();

    @Override
    public List<OneCProductDto> fetchProducts() {
        log.debug("[MockOneCClient] fetchProducts()");
        return List.of(
                new OneCProductDto("IPHONE-15-128", "iPhone 15", "Smartphone", "Electronics"),
                new OneCProductDto("MUG-001", "Coffee Mug", "Ceramic mug", "Home"),
                new OneCProductDto("BAG-001", "Leather Bag", "Genuine leather bag", "Accessories")
        );
    }

    @Override
    public List<OneCPriceDto> fetchPrices() {
        log.debug("[MockOneCClient] fetchPrices()");
        return List.of(
                new OneCPriceDto("IPHONE-15-128", new BigDecimal("67000")),
                new OneCPriceDto("MUG-001", new BigDecimal("450")),
                new OneCPriceDto("BAG-001", new BigDecimal("3200"))
        );
    }

    @Override
    public List<OneCStockDto> fetchStocks() {
        log.debug("[MockOneCClient] fetchStocks()");
        return List.of(
                new OneCStockDto("IPHONE-15-128", 20),
                new OneCStockDto("MUG-001", 100),
                new OneCStockDto("BAG-001", 15)
        );
    }

    @Override
    public void sendOrder(OneCOrderExportDto order) {
        log.info("[MockOneCClient] Received order {} ({} items, total {})",
                order.orderId(), order.items().size(), order.totalPrice());
        // Simulate 1C confirming the order shortly after receiving it.
        sentOrderStatuses.put(order.orderId(), "CONFIRMED");
    }

    @Override
    public List<OneCOrderStatusDto> fetchOrderStatuses() {
        log.debug("[MockOneCClient] fetchOrderStatuses()");
        return sentOrderStatuses.entrySet().stream()
                .map(entry -> new OneCOrderStatusDto(entry.getKey(), entry.getValue()))
                .toList();
    }
}
