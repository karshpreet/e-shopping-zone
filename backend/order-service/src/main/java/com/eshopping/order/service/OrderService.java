package com.eshopping.order.service;

import com.eshopping.order.dto.CheckoutRequest;
import com.eshopping.order.dto.OrderDto;
import com.eshopping.order.dto.OrderItemDto;
import com.eshopping.order.entity.Order;
import com.eshopping.order.entity.OrderItem;
import com.eshopping.order.exception.BadRequestException;
import com.eshopping.order.exception.OrderProcessingException;
import com.eshopping.order.exception.ResourceNotFoundException;
import com.eshopping.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Transactional
    public OrderDto checkout(CheckoutRequest request) {
        Long customerId = request.getCustomerId() != null ? request.getCustomerId() : 1L;

        // 1. Resolve items: from request, or fetch from CART-SERVICE
        List<CheckoutRequest.CheckoutItem> items = request.getItems();
        if (items == null || items.isEmpty()) {
            items = fetchItemsFromCartService(customerId);
        }

        // 2. Verify items are not empty
        if (items == null || items.isEmpty()) {
            throw new BadRequestException("Cannot checkout with an empty cart");
        }

        // 3 & 4. Verify product information and stock availability
        BigDecimal calculatedTotal = BigDecimal.ZERO;
        List<CheckoutRequest.CheckoutItem> verifiedItems = new ArrayList<>();

        for (CheckoutRequest.CheckoutItem item : items) {
            Map<String, Object> product = fetchProduct(item.getProductId());
            if (product == null) {
                throw new OrderProcessingException("Product " + item.getProductId() + " could not be verified");
            }

            Boolean active = (Boolean) product.get("active");
            if (Boolean.FALSE.equals(active)) {
                throw new OrderProcessingException("Product '" + product.get("name") + "' is no longer available");
            }

            int availableStock = product.get("stockQuantity") != null ? ((Number) product.get("stockQuantity")).intValue() : 0;
            if (availableStock < item.getQuantity()) {
                throw new OrderProcessingException("Insufficient stock for product '" + product.get("name") + 
                        "'. Requested: " + item.getQuantity() + ", Available: " + availableStock);
            }

            BigDecimal unitPrice = new BigDecimal(product.get("price").toString());
            item.setProductName((String) product.get("name"));
            item.setUnitPrice(unitPrice);
            item.setImageUrl((String) product.get("imageUrl"));

            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            calculatedTotal = calculatedTotal.add(subtotal);
            verifiedItems.add(item);
        }

        // 5 & 6. Determine Payment Method and Process
        String paymentMethod = request.getPaymentMethod().toUpperCase();
        String paymentStatus = "PENDING";
        String walletTxnId = null;

        if ("WALLET".equals(paymentMethod)) {
            // Call WALLET-SERVICE to deduct amount
            walletTxnId = processWalletPayment(customerId, calculatedTotal);
            paymentStatus = "PAID";
        } else if ("COD".equals(paymentMethod)) {
            paymentStatus = "PENDING";
        } else {
            throw new BadRequestException("Unsupported payment method: " + paymentMethod + ". Supported: 'WALLET', 'COD'");
        }

        // 7. Deduct Product Stock via PRODUCT-SERVICE
        for (CheckoutRequest.CheckoutItem item : verifiedItems) {
            deductProductStock(item.getProductId(), item.getQuantity());
        }

        // 8. Create Order Entity
        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String customerName = request.getCustomerName() != null ? request.getCustomerName() : "Valued Customer";
        String customerEmail = request.getCustomerEmail() != null ? request.getCustomerEmail() : "customer@eshop.com";

        Order order = new Order(
                orderNumber,
                customerId,
                customerName,
                customerEmail,
                calculatedTotal,
                paymentMethod,
                paymentStatus,
                "PLACED",
                request.getShippingAddress(),
                request.getContactPhone(),
                walletTxnId
        );

        for (CheckoutRequest.CheckoutItem item : verifiedItems) {
            BigDecimal subtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            OrderItem orderItem = new OrderItem(
                    order,
                    item.getProductId(),
                    item.getProductName(),
                    item.getUnitPrice(),
                    item.getQuantity(),
                    subtotal,
                    item.getImageUrl()
            );
            order.addItem(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        // 9. Clear customer's cart in CART-SERVICE
        clearCartInCartService(customerId);

        return mapToDto(savedOrder);
    }

    public List<OrderDto> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public OrderDto getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return mapToDto(order);
    }

    public OrderDto getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));
        return mapToDto(order);
    }

    public List<OrderDto> getAllOrdersForMerchant() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setOrderStatus(newStatus.toUpperCase());
        if ("DELIVERED".equalsIgnoreCase(newStatus) && "COD".equalsIgnoreCase(order.getPaymentMethod())) {
            order.setPaymentStatus("PAID");
        }

        Order saved = orderRepository.save(order);
        return mapToDto(saved);
    }

    // Helper: fetch cart items from CART-SERVICE via Eureka
    private List<CheckoutRequest.CheckoutItem> fetchItemsFromCartService(Long customerId) {
        try {
            String url = "http://CART-SERVICE/api/cart/" + customerId;
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
                    Map<String, Object> cartData = (Map<String, Object>) dataObj;
                    Object itemsObj = cartData.get("items");
                    if (itemsObj instanceof List) {
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> itemsList = (List<Map<String, Object>>) itemsObj;
                        List<CheckoutRequest.CheckoutItem> result = new ArrayList<>();
                        for (Map<String, Object> i : itemsList) {
                            CheckoutRequest.CheckoutItem ci = new CheckoutRequest.CheckoutItem();
                            ci.setProductId(((Number) i.get("productId")).longValue());
                            ci.setProductName((String) i.get("productName"));
                            if (i.get("unitPrice") != null) {
                                ci.setUnitPrice(new BigDecimal(i.get("unitPrice").toString()));
                            }
                            ci.setQuantity(((Number) i.get("quantity")).intValue());
                            ci.setImageUrl((String) i.get("imageUrl"));
                            result.add(ci);
                        }
                        return result;
                    }
                }
            }
        } catch (Exception ex) {
            logger.warn("Could not retrieve cart from CART-SERVICE: {}", ex.getMessage());
        }
        return Collections.emptyList();
    }

    // Helper: fetch product details from PRODUCT-SERVICE via Eureka
    private Map<String, Object> fetchProduct(Long productId) {
        try {
            String url = "http://PRODUCT-SERVICE/api/products/" + productId;
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                return data;
            }
        } catch (Exception ex) {
            logger.error("Error fetching product {} from PRODUCT-SERVICE: {}", productId, ex.getMessage());
        }
        return null;
    }

    // Helper: deduct product stock from PRODUCT-SERVICE via Eureka
    private void deductProductStock(Long productId, Integer quantity) {
        try {
            String url = "http://PRODUCT-SERVICE/api/products/" + productId + "/deduct-stock?quantity=" + quantity;
            restTemplate.postForEntity(url, null, Map.class);
        } catch (Exception ex) {
            logger.error("Error deducting stock for product {} in PRODUCT-SERVICE: {}", productId, ex.getMessage());
            throw new OrderProcessingException("Failed to update product inventory: " + ex.getMessage());
        }
    }

    // Helper: call WALLET-SERVICE to deduct payment via Eureka
    private String processWalletPayment(Long customerId, BigDecimal amount) {
        try {
            String url = "http://WALLET-SERVICE/api/wallet/" + customerId + "/deduct";
            Map<String, Object> deductRequest = new HashMap<>();
            deductRequest.put("amount", amount);
            deductRequest.put("orderReference", "CHECKOUT-" + System.currentTimeMillis());
            deductRequest.put("description", "Payment for order checkout");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(deductRequest);
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                if (data != null && data.get("transactionId") != null) {
                    return (String) data.get("transactionId");
                }
            }
            throw new OrderProcessingException("Wallet deduction response did not contain transaction ID");
        } catch (Exception ex) {
            logger.error("Wallet deduction failed for user {}: {}", customerId, ex.getMessage());
            throw new OrderProcessingException("Wallet payment failed: " + ex.getMessage());
        }
    }

    // Helper: clear customer cart in CART-SERVICE via Eureka
    private void clearCartInCartService(Long customerId) {
        try {
            String url = "http://CART-SERVICE/api/cart/" + customerId;
            restTemplate.delete(url);
        } catch (Exception ex) {
            logger.warn("Could not clear cart for user {} in CART-SERVICE: {}", customerId, ex.getMessage());
        }
    }

    private OrderDto mapToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setCustomerId(order.getCustomerId());
        dto.setCustomerName(order.getCustomerName());
        dto.setCustomerEmail(order.getCustomerEmail());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setOrderStatus(order.getOrderStatus());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setContactPhone(order.getContactPhone());
        dto.setWalletTransactionId(order.getWalletTransactionId());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        List<OrderItemDto> itemDtos = new ArrayList<>();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                OrderItemDto idto = new OrderItemDto();
                idto.setId(item.getId());
                idto.setProductId(item.getProductId());
                idto.setProductName(item.getProductName());
                idto.setUnitPrice(item.getUnitPrice());
                idto.setQuantity(item.getQuantity());
                idto.setSubtotal(item.getSubtotal());
                idto.setImageUrl(item.getImageUrl());
                itemDtos.add(idto);
            }
        }
        dto.setItems(itemDtos);
        return dto;
    }
}
