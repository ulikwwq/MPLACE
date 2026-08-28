package com.mplace.backend.order.service;

import com.mplace.backend.common.exception.InsufficientStockException;
import com.mplace.backend.common.exception.InvalidOrderException;
import com.mplace.backend.common.exception.OrderNotFoundException;
import com.mplace.backend.order.dto.OrderItemRequest;
import com.mplace.backend.order.dto.OrderRequest;
import com.mplace.backend.order.dto.OrderResponse;
import com.mplace.backend.order.entity.Order;
import com.mplace.backend.order.entity.OrderItem;
import com.mplace.backend.order.repository.OrderRepository;
import com.mplace.backend.product.entity.Product;
import com.mplace.backend.product.entity.ProductStatus;
import com.mplace.backend.product.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductService productService;

    public OrderService(OrderRepository orderRepository, ProductService productService) {
        this.orderRepository = orderRepository;
        this.productService = productService;
    }

    /**
     * Creates an order atomically: if any item cannot be purchased
     * (product missing, inactive, or out of stock), the whole order fails
     * and nothing is persisted.
     */
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new InvalidOrderException("Order must contain at least one item");
        }

        Order order = new Order(request.customerName(), request.customerPhone());

        for (OrderItemRequest itemRequest : request.items()) {
            order.addItem(buildOrderItem(itemRequest));
        }

        Order saved = orderRepository.save(order);
        log.info("Order created: id={}, items={}, totalPrice={}",
                saved.getId(), saved.getItems().size(), saved.getTotalPrice());

        return OrderResponse.from(saved);
    }

    private OrderItem buildOrderItem(OrderItemRequest itemRequest) {
        if (itemRequest.quantity() == null || itemRequest.quantity() <= 0) {
            throw new InvalidOrderException("quantity must be greater than 0");
        }

        // 2/3. find product, check it exists
        Product product = productService.findProductOrThrow(itemRequest.productId());

        // do not allow orders for inactive products
        if (product.getStatus() != ProductStatus.ACTIVE) {
            log.warn("Order creation failed: product {} is not active", product.getId());
            throw new InvalidOrderException(
                    "Product with id " + product.getId() + " is not active");
        }

        // 4. check stock availability
        if (!product.hasSufficientStock(itemRequest.quantity())) {
            log.warn("Order creation failed: insufficient stock for product {}", product.getId());
            throw new InsufficientStockException(
                    product.getId(), itemRequest.quantity(), product.getStockQuantity());
        }

        // 5/6/7/8. current price, create item, save unit price, calculate item total
        OrderItem item = new OrderItem(product, itemRequest.quantity(), product.getPrice());

        // 10. reduce available stock
        product.reduceStock(itemRequest.quantity());

        return item;
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        return OrderResponse.from(order);
    }
}
