package com.eshopping.cart.controller;

import com.eshopping.cart.dto.AddToCartRequest;
import com.eshopping.cart.dto.ApiResponse;
import com.eshopping.cart.dto.CartDto;
import com.eshopping.cart.dto.UpdateCartItemRequest;
import com.eshopping.cart.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<CartDto>> getCart(@PathVariable Long userId) {
        CartDto cart = cartService.getCartDtoByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
    }

    @PostMapping("/{userId}/items")
    public ResponseEntity<ApiResponse<CartDto>> addItem(
            @PathVariable Long userId,
            @Valid @RequestBody AddToCartRequest request) {
        CartDto cart = cartService.addItemToCart(userId, request);
        return new ResponseEntity<>(ApiResponse.success("Item added to cart", cart), HttpStatus.CREATED);
    }

    @PutMapping("/{userId}/items/{productId}")
    public ResponseEntity<ApiResponse<CartDto>> updateQuantity(
            @PathVariable Long userId,
            @PathVariable Long productId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        CartDto cart = cartService.updateItemQuantity(userId, productId, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success("Cart item quantity updated", cart));
    }

    @DeleteMapping("/{userId}/items/{productId}")
    public ResponseEntity<ApiResponse<CartDto>> removeItem(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        CartDto cart = cartService.removeItemFromCart(userId, productId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully"));
    }

    // Header-based fallback for internal inter-service calls or gateway forwarding
    @GetMapping
    public ResponseEntity<ApiResponse<CartDto>> getCartByHeader(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            userId = 1L; // default fallback
        }
        CartDto cart = cartService.getCartDtoByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCartByHeader(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId != null) {
            cartService.clearCart(userId);
        }
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully"));
    }
}
