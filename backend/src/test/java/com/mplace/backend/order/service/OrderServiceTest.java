package com.mplace.backend.order.service;

import com.mplace.backend.common.exception.InsufficientStockException;
import com.mplace.backend.common.exception.InvalidOrderException;
import com.mplace.backend.common.exception.OrderNotFoundException;
import com.mplace.backend.common.exception.ProductNotFoundException;
import com.mplace.backend.order.dto.OrderItemRequest;
import com.mplace.backend.order.dto.OrderRequest;
import com.mplace.backend.order.dto.OrderResponse;
import com.mplace.backend.order.entity.Order;
import com.mplace.backend.order.repository.OrderRepository;
import com.mplace.backend.product.entity.Category;
import com.mplace.backend.product.entity.Product;
import com.mplace.backend.product.entity.ProductStatus;
import com.mplace.backend.product.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductService productService;

    private OrderService orderService;

    private Product iphone;

    @BeforeEach
    void setUp() throws Exception {
        orderService = new OrderService(orderRepository, productService);

        Category electronics = new Category("Electronics");
        setId(electronics, 1L);

        iphone = new Product("IPHONE-15-128", "iPhone 15", "Smartphone",
                new BigDecimal("65000"), 12, ProductStatus.ACTIVE, electronics);
        setId(iphone, 1L);

        // save() persists nothing in this unit test; just echo back the same
        // Order instance so the response DTO can be built from it.
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void createOrder_success_calculatesTotalsAndReducesStock() {
        when(productService.findProductOrThrow(1L)).thenReturn(iphone);

        OrderRequest request = new OrderRequest("Test Customer", "+996700000000",
                List.of(new OrderItemRequest(1L, 2)));

        OrderResponse response = orderService.createOrder(request);

        assertEquals("NEW", response.status());
        assertEquals(new BigDecimal("130000"), response.totalPrice());
        assertEquals(1, response.items().size());
        assertEquals(new BigDecimal("65000"), response.items().get(0).unitPrice());
        assertEquals(new BigDecimal("130000"), response.items().get(0).totalPrice());

        // stock reduced from 12 to 10
        assertEquals(10, iphone.getStockQuantity());
    }

    @Test
    void createOrder_correctlyCalculatesTotalAcrossMultipleItems() throws Exception {
        Category home = new Category("Home");
        setId(home, 2L);
        Product mug = new Product("MUG-001", "Coffee Mug", "Ceramic mug",
                new BigDecimal("500"), 50, ProductStatus.ACTIVE, home);
        setId(mug, 2L);

        when(productService.findProductOrThrow(1L)).thenReturn(iphone);
        when(productService.findProductOrThrow(2L)).thenReturn(mug);

        OrderRequest request = new OrderRequest("Test Customer", "+996700000000",
                List.of(new OrderItemRequest(1L, 1), new OrderItemRequest(2L, 3)));

        OrderResponse response = orderService.createOrder(request);

        // 65000 * 1 + 500 * 3 = 66500
        assertEquals(new BigDecimal("66500"), response.totalPrice());
        assertEquals(2, response.items().size());
    }

    @Test
    void createOrder_productNotFound_throwsAndDoesNotSave() {
        when(productService.findProductOrThrow(99L))
                .thenThrow(new ProductNotFoundException(99L));

        OrderRequest request = new OrderRequest("Test Customer", "+996700000000",
                List.of(new OrderItemRequest(99L, 1)));

        assertThrows(ProductNotFoundException.class, () -> orderService.createOrder(request));
    }

    @Test
    void createOrder_insufficientStock_throwsInsufficientStockException() {
        when(productService.findProductOrThrow(1L)).thenReturn(iphone);

        OrderRequest request = new OrderRequest("Test Customer", "+996700000000",
                List.of(new OrderItemRequest(1L, 999))); // only 12 in stock

        assertThrows(InsufficientStockException.class, () -> orderService.createOrder(request));
        // stock must be untouched since the order failed
        assertEquals(12, iphone.getStockQuantity());
    }

    @Test
    void createOrder_inactiveProduct_throwsInvalidOrderException() {
        iphone.setStatus(ProductStatus.INACTIVE);
        when(productService.findProductOrThrow(1L)).thenReturn(iphone);

        OrderRequest request = new OrderRequest("Test Customer", "+996700000000",
                List.of(new OrderItemRequest(1L, 1)));

        assertThrows(InvalidOrderException.class, () -> orderService.createOrder(request));
    }

    @Test
    void createOrder_invalidQuantity_throwsInvalidOrderException() {
        when(productService.findProductOrThrow(1L)).thenReturn(iphone);

        OrderRequest request = new OrderRequest("Test Customer", "+996700000000",
                List.of(new OrderItemRequest(1L, 0)));

        assertThrows(InvalidOrderException.class, () -> orderService.createOrder(request));
    }

    @Test
    void createOrder_emptyItems_throwsInvalidOrderException() {
        OrderRequest request = new OrderRequest("Test Customer", "+996700000000", List.of());

        assertThrows(InvalidOrderException.class, () -> orderService.createOrder(request));
    }

    @Test
    void getOrderById_whenMissing_throwsOrderNotFoundException() {
        when(orderRepository.findById(anyLong())).thenReturn(Optional.empty());

        OrderNotFoundException ex = assertThrows(OrderNotFoundException.class,
                () -> orderService.getOrderById(404L));
        assertTrue(ex.getMessage().contains("404"));
    }

    /** Test-only helper: entities have no public id setter, ids are DB-generated. */
    private static void setId(Object entity, Long id) throws Exception {
        Field idField = entity.getClass().getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(entity, id);
    }
}
