package com.eshopping.product.service;

import com.eshopping.product.dto.CreateProductRequest;
import com.eshopping.product.dto.DeductStockRequest;
import com.eshopping.product.dto.ProductDto;
import com.eshopping.product.dto.UpdateProductRequest;
import com.eshopping.product.entity.Category;
import com.eshopping.product.entity.Product;
import com.eshopping.product.exception.BadRequestException;
import com.eshopping.product.exception.InsufficientStockException;
import com.eshopping.product.exception.ResourceNotFoundException;
import com.eshopping.product.repository.CategoryRepository;
import com.eshopping.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<ProductDto> getAllActiveProducts() {
        return productRepository.findByActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToDto(product);
    }

    public List<ProductDto> searchProducts(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllActiveProducts();
        }
        return productRepository.searchProducts(query.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryIdAndActiveTrue(categoryId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> getProductsByMerchant(Long merchantId) {
        return productRepository.findByMerchantId(merchantId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDto createProduct(CreateProductRequest request, Long merchantId) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        Long effectiveMerchantId = merchantId != null ? merchantId : request.getMerchantId();
        if (effectiveMerchantId == null) {
            effectiveMerchantId = 2L; // Default demo merchant ID
        }

        Product product = new Product(
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getStockQuantity(),
                category,
                request.getImageUrl(),
                effectiveMerchantId
        );

        Product saved = productRepository.save(product);
        return mapToDto(saved);
    }

    @Transactional
    public ProductDto updateProduct(Long id, UpdateProductRequest request, Long merchantId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // Merchant authorization check (if merchantId is provided)
        if (merchantId != null && !product.getMerchantId().equals(merchantId)) {
            throw new BadRequestException("You can only modify products that belong to your merchant account");
        }

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getStockQuantity() != null) product.setStockQuantity(request.getStockQuantity());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getActive() != null) product.setActive(request.getActive());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        Product updated = productRepository.save(product);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteProduct(Long id, Long merchantId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (merchantId != null && !product.getMerchantId().equals(merchantId)) {
            throw new BadRequestException("You can only delete products that belong to your merchant account");
        }

        // Soft delete: set active = false
        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional
    public ProductDto deductStock(Long productId, Integer quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity to deduct must be greater than 0");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (product.getStockQuantity() < quantity) {
            throw new InsufficientStockException(product.getName(), quantity, product.getStockQuantity());
        }

        product.setStockQuantity(product.getStockQuantity() - quantity);
        Product saved = productRepository.save(product);
        return mapToDto(saved);
    }

    @Transactional
    public List<ProductDto> deductBatchStock(DeductStockRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Stock deduction request must contain at least one item");
        }

        // 1. Verify all stock first to avoid partial deduction failures
        for (DeductStockRequest.Item item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", item.getProductId()));

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new InsufficientStockException(product.getName(), item.getQuantity(), product.getStockQuantity());
            }
        }

        // 2. Perform deductions
        List<ProductDto> updatedProducts = new ArrayList<>();
        for (DeductStockRequest.Item item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId()).get();
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            Product saved = productRepository.save(product);
            updatedProducts.add(mapToDto(saved));
        }

        return updatedProducts;
    }

    public boolean verifyStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        return product.getActive() && product.getStockQuantity() >= quantity;
    }

    public ProductDto mapToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setImageUrl(product.getImageUrl());
        dto.setMerchantId(product.getMerchantId());
        dto.setActive(product.getActive());

        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }
        return dto;
    }
}
