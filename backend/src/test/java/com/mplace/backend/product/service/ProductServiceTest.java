package com.mplace.backend.product.service;

import com.mplace.backend.common.exception.ProductNotFoundException;
import com.mplace.backend.product.dto.ProductResponse;
import com.mplace.backend.product.entity.Category;
import com.mplace.backend.product.entity.Product;
import com.mplace.backend.product.entity.ProductStatus;
import com.mplace.backend.product.repository.ProductRepository;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    private ProductService productService;

    private Product iphone;

    @BeforeEach
    void setUp() throws Exception {
        productService = new ProductService(productRepository);

        Category electronics = new Category("Electronics");
        setId(electronics, 1L);

        iphone = new Product("IPHONE-15-128", "iPhone 15", "Smartphone",
                new BigDecimal("65000"), 12, ProductStatus.ACTIVE, electronics);
        setId(iphone, 1L);
    }

    @Test
    void getAllProducts_returnsAllProductsAsDtos() {
        when(productRepository.findAll()).thenReturn(List.of(iphone));

        List<ProductResponse> result = productService.getAllProducts();

        assertEquals(1, result.size());
        assertEquals("IPHONE-15-128", result.get(0).sku());
        assertEquals(1L, result.get(0).categoryId());
    }

    @Test
    void getProductById_whenExists_returnsDto() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(iphone));

        ProductResponse result = productService.getProductById(1L);

        assertEquals(1L, result.id());
        assertEquals("iPhone 15", result.name());
        assertEquals("ACTIVE", result.status());
    }

    @Test
    void getProductById_whenMissing_throwsProductNotFoundException() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        ProductNotFoundException ex = assertThrows(ProductNotFoundException.class,
                () -> productService.getProductById(99L));
        assertTrue(ex.getMessage().contains("99"));
    }

    @Test
    void getProductsByCategory_delegatesToRepository() {
        when(productRepository.findByCategoryId(1L)).thenReturn(List.of(iphone));

        List<ProductResponse> result = productService.getProductsByCategory(1L);

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).categoryId());
    }

    /** Test-only helper: entities have no public id setter, ids are DB-generated. */
    private static void setId(Object entity, Long id) throws Exception {
        Field idField = entity.getClass().getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(entity, id);
    }
}
