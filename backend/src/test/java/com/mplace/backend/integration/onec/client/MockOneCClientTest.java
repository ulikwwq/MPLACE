package com.mplace.backend.integration.onec.client;

import com.mplace.backend.integration.onec.dto.OneCOrderExportDto;
import com.mplace.backend.integration.onec.dto.OneCOrderStatusDto;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MockOneCClientTest {

    private final MockOneCClient client = new MockOneCClient();

    @Test
    void fetchProducts_returnsNonEmptyCatalog() {
        assertFalse(client.fetchProducts().isEmpty());
    }

    @Test
    void fetchPrices_returnsNonEmptyList() {
        assertFalse(client.fetchPrices().isEmpty());
    }

    @Test
    void fetchStocks_returnsNonEmptyList() {
        assertFalse(client.fetchStocks().isEmpty());
    }

    @Test
    void fetchOrderStatuses_isEmpty_untilAnOrderIsSent() {
        assertTrue(client.fetchOrderStatuses().isEmpty());

        client.sendOrder(new OneCOrderExportDto(
                1L, "Test Customer", "+996700000000", "NEW", new BigDecimal("100"), List.of()));

        List<OneCOrderStatusDto> statuses = client.fetchOrderStatuses();
        assertEquals(1, statuses.size());
        assertEquals(1L, statuses.get(0).orderId());
        assertEquals("CONFIRMED", statuses.get(0).status());
    }
}
