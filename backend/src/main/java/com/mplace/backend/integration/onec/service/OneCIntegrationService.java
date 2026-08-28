package com.mplace.backend.integration.onec.service;

import com.mplace.backend.common.exception.OneCIntegrationException;
import com.mplace.backend.common.exception.OrderNotFoundException;
import com.mplace.backend.integration.onec.client.OneCClient;
import com.mplace.backend.integration.onec.dto.OneCOrderExportDto;
import com.mplace.backend.integration.onec.dto.OneCOrderItemDto;
import com.mplace.backend.integration.onec.dto.OneCOrderStatusDto;
import com.mplace.backend.integration.onec.dto.OneCPriceDto;
import com.mplace.backend.integration.onec.dto.OneCProductDto;
import com.mplace.backend.integration.onec.dto.OneCStockDto;
import com.mplace.backend.order.entity.Order;
import com.mplace.backend.order.entity.OrderStatus;
import com.mplace.backend.order.repository.OrderRepository;
import com.mplace.backend.product.entity.Category;
import com.mplace.backend.product.entity.Product;
import com.mplace.backend.product.entity.ProductStatus;
import com.mplace.backend.product.repository.CategoryRepository;
import com.mplace.backend.product.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Sits between the 1C abstraction (OneCClient) and MPlace's own data.
 * The rest of the application (ProductService, OrderService) never talks
 * to OneCClient directly.
 */
@Service
public class OneCIntegrationService {

    private static final Logger log = LoggerFactory.getLogger(OneCIntegrationService.class);

    private final OneCClient oneCClient;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;

    public OneCIntegrationService(OneCClient oneCClient,
                                   ProductRepository productRepository,
                                   CategoryRepository categoryRepository,
                                   OrderRepository orderRepository) {
        this.oneCClient = oneCClient;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.orderRepository = orderRepository;
    }

    /** 1C -> MPlace: catalog data (sku, name, description, category). */
    @Transactional
    public void importProducts() {
        log.info("Product synchronization started");
        List<OneCProductDto> products = fetchOrFail(oneCClient::fetchProducts, "fetch products");

        int created = 0;
        int updated = 0;
        for (OneCProductDto dto : products) {
            Category category = categoryRepository.findByName(dto.categoryName())
                    .orElseGet(() -> categoryRepository.save(new Category(dto.categoryName())));

            Optional<Product> existing = productRepository.findBySku(dto.sku());
            if (existing.isPresent()) {
                Product product = existing.get();
                product.setName(dto.name());
                product.setDescription(dto.description());
                product.setCategory(category);
                updated++;
            } else {
                Product product = new Product(dto.sku(), dto.name(), dto.description(),
                        BigDecimal.ZERO, 0, ProductStatus.ACTIVE, category);
                productRepository.save(product);
                created++;
            }
        }
        log.info("Product synchronization completed: {} created, {} updated", created, updated);
    }

    /** 1C -> MPlace: current selling prices. */
    @Transactional
    public void importPrices() {
        log.info("Price synchronization started");
        List<OneCPriceDto> prices = fetchOrFail(oneCClient::fetchPrices, "fetch prices");

        int updated = 0;
        for (OneCPriceDto dto : prices) {
            Optional<Product> product = productRepository.findBySku(dto.sku());
            if (product.isEmpty()) {
                log.warn("Price sync: no product found for SKU {}", dto.sku());
                continue;
            }
            product.get().setPrice(dto.price());
            updated++;
        }
        log.info("Price synchronization completed: {} updated", updated);
    }

    /** 1C -> MPlace: current stock levels. */
    @Transactional
    public void importStock() {
        log.info("Stock synchronization started");
        List<OneCStockDto> stocks = fetchOrFail(oneCClient::fetchStocks, "fetch stock");

        int updated = 0;
        for (OneCStockDto dto : stocks) {
            Optional<Product> product = productRepository.findBySku(dto.sku());
            if (product.isEmpty()) {
                log.warn("Stock sync: no product found for SKU {}", dto.sku());
                continue;
            }
            product.get().setStockQuantity(dto.quantity());
            updated++;
        }
        log.info("Stock synchronization completed: {} updated", updated);
    }

    /** MPlace -> 1C: export a single order. */
    @Transactional(readOnly = true)
    public void exportOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        List<OneCOrderItemDto> items = order.getItems().stream()
                .map(item -> new OneCOrderItemDto(
                        item.getProduct().getSku(), item.getQuantity(), item.getUnitPrice()))
                .toList();

        OneCOrderExportDto dto = new OneCOrderExportDto(
                order.getId(), order.getCustomerName(), order.getCustomerPhone(),
                order.getStatus().name(), order.getTotalPrice(), items);

        try {
            oneCClient.sendOrder(dto);
            log.info("Order {} exported to 1C", orderId);
        } catch (RuntimeException ex) {
            log.error("1C integration request failed while exporting order {}: {}", orderId, ex.getMessage());
            throw new OneCIntegrationException("Failed to export order " + orderId + " to 1C", ex);
        }
    }

    /** 1C -> MPlace: order status updates. */
    @Transactional
    public void importOrderStatuses() {
        log.info("Order status synchronization started");
        List<OneCOrderStatusDto> statuses = fetchOrFail(oneCClient::fetchOrderStatuses, "fetch order statuses");

        int updated = 0;
        for (OneCOrderStatusDto dto : statuses) {
            Optional<Order> order = orderRepository.findById(dto.orderId());
            if (order.isEmpty()) {
                log.warn("Order status sync: no order found for id {}", dto.orderId());
                continue;
            }
            try {
                order.get().setStatus(OrderStatus.valueOf(dto.status()));
                updated++;
            } catch (IllegalArgumentException ex) {
                log.warn("Order status sync: unknown status '{}' for order {}", dto.status(), dto.orderId());
            }
        }
        log.info("Order status synchronization completed: {} updated", updated);
    }

    private <T> T fetchOrFail(java.util.function.Supplier<T> call, String operation) {
        try {
            return call.get();
        } catch (RuntimeException ex) {
            log.error("1C integration request failed: {} - {}", operation, ex.getMessage());
            throw new OneCIntegrationException("Failed to " + operation + " from 1C", ex);
        }
    }
}
