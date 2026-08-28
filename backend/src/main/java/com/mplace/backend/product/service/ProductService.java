package com.mplace.backend.product.service;

import com.mplace.backend.common.exception.ProductNotFoundException;
import com.mplace.backend.product.dto.ProductResponse;
import com.mplace.backend.product.entity.Product;
import com.mplace.backend.product.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        return ProductResponse.from(findProductOrThrow(id));
    }

    /**
     * Returns the managed entity. Used internally by other services
     * (e.g. OrderService in Phase 3) that need the real Product, not the DTO.
     */
    @Transactional(readOnly = true)
    public Product findProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }
}
