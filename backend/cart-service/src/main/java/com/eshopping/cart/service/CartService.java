package com.eshopping.cart.service;

import com.eshopping.cart.dto.AddToCartRequest;
import com.eshopping.cart.dto.CartDto;
import com.eshopping.cart.dto.CartItemDto;
import com.eshopping.cart.dto.ProductDto;
import com.eshopping.cart.entity.Cart;
import com.eshopping.cart.entity.CartItem;
import com.eshopping.cart.exception.BadRequestException;
import com.eshopping.cart.exception.ResourceNotFoundException;
import com.eshopping.cart.repository.CartItemRepository;
import com.eshopping.cart.repository.CartRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CartService {

    private static final Logger logger = LoggerFactory.getLogger(CartService.class);

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private RestTemplate restTemplate;

    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart(userId);
                    return cartRepository.save(newCart);
                });
    }

    public CartDto getCartDtoByUserId(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToDto(cart);
    }

    @Transactional
    public CartDto addItemToCart(Long userId, AddToCartRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }

        Cart cart = getOrCreateCart(userId);

        // Fetch latest product details and stock from Product Service
        ProductDto product = fetchProductDetails(request.getProductId());

        String productName = request.getProductName();
        BigDecimal unitPrice = request.getUnitPrice();
        String imageUrl = request.getImageUrl();

        if (product != null) {
            if (Boolean.FALSE.equals(product.getActive())) {
                throw new BadRequestException("Product is currently unavailable");
            }
            productName = product.getName();
            unitPrice = product.getPrice();
            imageUrl = product.getImageUrl();

            // Verify stock
            if (product.getStockQuantity() != null && product.getStockQuantity() < request.getQuantity()) {
                throw new BadRequestException("Requested quantity (" + request.getQuantity() + 
                        ") exceeds available stock (" + product.getStockQuantity() + ")");
            }
        }

        if (productName == null || unitPrice == null) {
            throw new BadRequestException("Product details could not be resolved");
        }

        // Check if item already exists in cart
        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();

            if (product != null && product.getStockQuantity() != null && product.getStockQuantity() < newQuantity) {
                throw new BadRequestException("Total quantity in cart (" + newQuantity + 
                        ") would exceed available stock (" + product.getStockQuantity() + ")");
            }

            existingItem.setQuantity(newQuantity);
            existingItem.setUnitPrice(unitPrice);
            existingItem.setProductName(productName);
            if (imageUrl != null) existingItem.setImageUrl(imageUrl);
        } else {
            CartItem newItem = new CartItem(cart, request.getProductId(), productName, unitPrice, request.getQuantity(), imageUrl);
            cart.addItem(newItem);
        }

        Cart savedCart = cartRepository.save(cart);
        return mapToDto(savedCart);
    }

    @Transactional
    public CartDto updateItemQuantity(Long userId, Long productId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + userId));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Product " + productId + " not found in user cart"));

        ProductDto product = fetchProductDetails(productId);
        if (product != null && product.getStockQuantity() != null && product.getStockQuantity() < quantity) {
            throw new BadRequestException("Requested quantity (" + quantity + 
                    ") exceeds available stock (" + product.getStockQuantity() + ")");
        }

        item.setQuantity(quantity);
        Cart savedCart = cartRepository.save(cart);
        return mapToDto(savedCart);
    }

    @Transactional
    public CartDto removeItemFromCart(Long userId, Long productId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + userId));

        Optional<CartItem> itemOpt = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst();

        if (itemOpt.isPresent()) {
            cart.removeItem(itemOpt.get());
            cartRepository.save(cart);
        }

        return mapToDto(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart != null) {
            cart.getItems().clear();
            cartRepository.save(cart);
        }
    }

    private ProductDto fetchProductDetails(Long productId) {
        try {
            String url = "http://PRODUCT-SERVICE/api/products/" + productId;
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                Object dataObj = body.get("data");
                if (dataObj instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = (Map<String, Object>) dataObj;
                    ProductDto dto = new ProductDto();
                    dto.setId(productId);
                    dto.setName((String) data.get("name"));
                    if (data.get("price") != null) {
                        dto.setPrice(new BigDecimal(data.get("price").toString()));
                    }
                    if (data.get("stockQuantity") != null) {
                        dto.setStockQuantity(((Number) data.get("stockQuantity")).intValue());
                    }
                    dto.setImageUrl((String) data.get("imageUrl"));
                    dto.setActive((Boolean) data.get("active"));
                    return dto;
                }
            }
        } catch (Exception ex) {
            logger.warn("Could not fetch product details from PRODUCT-SERVICE for productId {}: {}", productId, ex.getMessage());
        }
        return null;
    }

    private CartDto mapToDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUserId());

        List<CartItemDto> itemDtos = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        int count = 0;

        if (cart.getItems() != null) {
            for (CartItem item : cart.getItems()) {
                CartItemDto itemDto = new CartItemDto();
                itemDto.setId(item.getId());
                itemDto.setProductId(item.getProductId());
                itemDto.setProductName(item.getProductName());
                itemDto.setUnitPrice(item.getUnitPrice());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setImageUrl(item.getImageUrl());

                BigDecimal subtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                itemDto.setSubtotal(subtotal);

                itemDtos.add(itemDto);
                total = total.add(subtotal);
                count += item.getQuantity();
            }
        }

        dto.setItems(itemDtos);
        dto.setTotalAmount(total);
        dto.setItemCount(count);
        return dto;
    }
}
