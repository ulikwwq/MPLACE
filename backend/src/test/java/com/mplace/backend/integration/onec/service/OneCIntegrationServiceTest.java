package com.mplace.backend.integration.onec.service;

import com.mplace.backend.common.exception.OneCIntegrationException;
import com.mplace.backend.common.exception.OrderNotFoundException;
import com.mplace.backend.integration.onec.client.OneCClient;
import com.mplace.backend.integration.onec.dto.OneCOrderExportDto;
import com.mplace.backend.integration.onec.dto.OneCOrderStatusDto;
import com.mplace.backend.integration.onec.dto.OneCPriceDto;
import com.mplace.backend.integration.onec.dto.OneCProductDto;
import com.mplace.backend.integration.onec.dto.OneCStockDto;
import com.mplace.backend.order.entity.Order;
import com.mplace.backend.order.entity.OrderItem;
import com.mplace.backend.order.entity.OrderStatus;
import com.mplace.backend.order.repository.OrderRepository;
import com.mplace.backend.product.entity.Category;
import com.mplace.backend.product.entity.Product;
import com.mplace.backend.product.entity.ProductStatus;
import com.mplace.backend.product.repository.CategoryRepository;
import com.mplace.backend.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OneCIntegrationServiceTest {

    @Mock
    private OneCClient oneCClient;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private OrderRepository orderRepository;

    private OneCIntegrationService integrationService;

    @BeforeEach
    void setUp() {
        integrationService = new OneCIntegrationService(
                oneCClient, productRepository, categoryRepository, orderRepository);
    }

    @Test
    void importProducts_createsNewProduct_whenSkuUnknown() {
        when(oneCClient.fetchProducts()).thenReturn(
                List.of(new OneCProductDto("NEW-SKU", "New Thing", "desc", "Electronics")));
        when(categoryRepository.findByName("Electronics")).thenReturn(Optional.empty());
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productRepository.findBySku("NEW-SKU")).thenReturn(Optional.empty());

        integrationService.importProducts();

        ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(captor.capture());
        assertEquals("NEW-SKU", captor.getValue().getSku());
        assertEquals(BigDecimal.ZERO, captor.getValue().getPrice());
        assertEquals(0, captor.getValue().getStockQuantity());
    }

    @Test
    void importProducts_updatesExistingProduct_whenSkuKnown() throws Exception {
        Category electronics = new Category("Electronics");
        setId(electronics, 1L);
        Product existing = new Product("EXIST-SKU", "Old Name", "old desc",
                new BigDecimal("100"), 5, ProductStatus.ACTIVE, electronics);

        when(oneCClient.fetchProducts()).thenReturn(
                List.of(new OneCProductDto("EXIST-SKU", "New Name", "new desc", "Electronics")));
        when(categoryRepository.findByName("Electronics")).thenReturn(Optional.of(electronics));
        when(productRepository.findBySku("EXIST-SKU")).thenReturn(Optional.of(existing));

        integrationService.importProducts();

        assertEquals("New Name", existing.getName());
        assertEquals("new desc", existing.getDescription());
        verify(productRepository, never()).save(any());
    }

    @Test
    void importPrices_updatesMatchingProduct_andSkipsUnknownSku() throws Exception {
        Category electronics = new Category("Electronics");
        Product product = new Product("SKU-1", "Thing", "desc",
                new BigDecimal("100"), 5, ProductStatus.ACTIVE, electronics);

        when(oneCClient.fetchPrices()).thenReturn(List.of(
                new OneCPriceDto("SKU-1", new BigDecimal("150")),
                new OneCPriceDto("UNKNOWN-SKU", new BigDecimal("999"))));
        when(productRepository.findBySku("SKU-1")).thenReturn(Optional.of(product));
        when(productRepository.findBySku("UNKNOWN-SKU")).thenReturn(Optional.empty());

        integrationService.importPrices();

        assertEquals(new BigDecimal("150"), product.getPrice());
    }

    @Test
    void importStock_updatesMatchingProduct() throws Exception {
        Category electronics = new Category("Electronics");
        Product product = new Product("SKU-1", "Thing", "desc",
                new BigDecimal("100"), 5, ProductStatus.ACTIVE, electronics);

        when(oneCClient.fetchStocks()).thenReturn(List.of(new OneCStockDto("SKU-1", 42)));
        when(productRepository.findBySku("SKU-1")).thenReturn(Optional.of(product));

        integrationService.importStock();

        assertEquals(42, product.getStockQuantity());
    }

    @Test
    void exportOrder_sendsCorrectlyMappedDto() throws Exception {
        Category electronics = new Category("Electronics");
        Product product = new Product("SKU-1", "Thing", "desc",
                new BigDecimal("100"), 5, ProductStatus.ACTIVE, electronics);
        setId(product, 1L);

        Order order = new Order("Jane Doe", "+996700000000");
        setId(order, 55L);
        order.addItem(new OrderItem(product, 2, new BigDecimal("100")));

        when(orderRepository.findById(55L)).thenReturn(Optional.of(order));

        integrationService.exportOrder(55L);

        ArgumentCaptor<OneCOrderExportDto> captor = ArgumentCaptor.forClass(OneCOrderExportDto.class);
        verify(oneCClient).sendOrder(captor.capture());
        assertEquals(55L, captor.getValue().orderId());
        assertEquals("SKU-1", captor.getValue().items().get(0).sku());
        assertEquals(new BigDecimal("200"), captor.getValue().totalPrice());
    }

    @Test
    void exportOrder_whenOrderMissing_throwsOrderNotFoundException() {
        when(orderRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(OrderNotFoundException.class, () -> integrationService.exportOrder(404L));
    }

    @Test
    void exportOrder_wrapsClientFailure_inOneCIntegrationException() throws Exception {
        Category electronics = new Category("Electronics");
        Product product = new Product("SKU-1", "Thing", "desc",
                new BigDecimal("100"), 5, ProductStatus.ACTIVE, electronics);
        Order order = new Order("Jane Doe", "+996700000000");
        setId(order, 1L);
        order.addItem(new OrderItem(product, 1, new BigDecimal("100")));

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        org.mockito.Mockito.doThrow(new RuntimeException("1C down"))
                .when(oneCClient).sendOrder(any());

        assertThrows(OneCIntegrationException.class, () -> integrationService.exportOrder(1L));
    }

    @Test
    void importOrderStatuses_updatesKnownOrder_skipsUnknownOrderAndInvalidStatus() {
        Order order = new Order("Jane Doe", "+996700000000");

        when(oneCClient.fetchOrderStatuses()).thenReturn(List.of(
                new OneCOrderStatusDto(1L, "CONFIRMED"),
                new OneCOrderStatusDto(2L, "NOT_A_REAL_STATUS"),
                new OneCOrderStatusDto(404L, "CONFIRMED")));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.findById(2L)).thenReturn(Optional.of(new Order("X", "Y")));
        when(orderRepository.findById(404L)).thenReturn(Optional.empty());

        integrationService.importOrderStatuses();

        assertEquals(OrderStatus.CONFIRMED, order.getStatus());
    }

    /** Test-only helper: entities have no public id setter, ids are DB-generated. */
    private static void setId(Object entity, Long id) throws Exception {
        Field idField = entity.getClass().getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(entity, id);
    }
}
