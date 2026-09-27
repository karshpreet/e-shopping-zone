package com.eshopping.product.controller;

import com.eshopping.product.dto.*;
import com.eshopping.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDto>>> getAllProducts(
            @RequestParam(required = false) Long merchantId) {
        List<ProductDto> products;
        if (merchantId != null) {
            products = productService.getProductsByMerchant(merchantId);
        } else {
            products = productService.getAllActiveProducts();
        }
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(@PathVariable Long id) {
        ProductDto product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductDto>>> searchProducts(@RequestParam(value = "query", required = false) String query) {
        List<ProductDto> products = productService.searchProducts(query);
        return ResponseEntity.ok(ApiResponse.success("Products searched successfully", products));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getProductsByCategory(@PathVariable Long categoryId) {
        List<ProductDto> products = productService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success("Category products retrieved successfully", products));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(
            @Valid @RequestBody CreateProductRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        ProductDto product = productService.createProduct(request, userId);
        return new ResponseEntity<>(ApiResponse.success("Product created successfully", product), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        ProductDto product = productService.updateProduct(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        productService.deleteProduct(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully"));
    }

    // Inter-service endpoint for Order Service checkout: Deduct single product stock
    @PostMapping("/{id}/deduct-stock")
    public ResponseEntity<ApiResponse<ProductDto>> deductStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        ProductDto product = productService.deductStock(id, quantity);
        return ResponseEntity.ok(ApiResponse.success("Stock deducted successfully", product));
    }

    // Inter-service endpoint for Order Service checkout: Deduct batch product stock
    @PostMapping("/deduct-batch")
    public ResponseEntity<ApiResponse<List<ProductDto>>> deductBatchStock(
            @Valid @RequestBody DeductStockRequest request) {
        List<ProductDto> updatedProducts = productService.deductBatchStock(request);
        return ResponseEntity.ok(ApiResponse.success("Batch stock deducted successfully", updatedProducts));
    }

    // Inter-service endpoint for Cart/Order Service: Verify product stock availability
    @GetMapping("/{id}/verify-stock")
    public ResponseEntity<ApiResponse<Boolean>> verifyStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        boolean available = productService.verifyStock(id, quantity);
        return ResponseEntity.ok(ApiResponse.success("Stock verified", available));
    }
}
