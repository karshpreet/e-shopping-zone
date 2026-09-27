package com.eshopping.order.controller;

import com.eshopping.order.dto.ApiResponse;
import com.eshopping.order.dto.CheckoutRequest;
import com.eshopping.order.dto.OrderDto;
import com.eshopping.order.dto.UpdateOrderStatusRequest;
import com.eshopping.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderDto>> checkout(
            @Valid @RequestBody CheckoutRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId) {
        if (request.getCustomerId() == null && headerUserId != null) {
            request.setCustomerId(headerUserId);
        }
        OrderDto order = orderService.checkout(request);
        return new ResponseEntity<>(ApiResponse.success("Order placed successfully", order), HttpStatus.CREATED);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getCustomerOrders(@PathVariable Long customerId) {
        List<OrderDto> orders = orderService.getOrdersByCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success("Customer orders retrieved successfully", orders));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getMyOrders(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId) {
        Long customerId = headerUserId != null ? headerUserId : 1L;
        List<OrderDto> orders = orderService.getOrdersByCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success("Customer orders retrieved successfully", orders));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable Long orderId) {
        OrderDto order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderByNumber(@PathVariable String orderNumber) {
        OrderDto order = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
    }

    @GetMapping("/merchant")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getMerchantOrders() {
        List<OrderDto> orders = orderService.getAllOrdersForMerchant();
        return ResponseEntity.ok(ApiResponse.success("Merchant orders retrieved successfully", orders));
    }

    @GetMapping("/merchant/all")
    public ResponseEntity<ApiResponse<List<OrderDto>>> getAllOrdersForMerchant() {
        List<OrderDto> orders = orderService.getAllOrdersForMerchant();
        return ResponseEntity.ok(ApiResponse.success("All orders retrieved successfully", orders));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderDto updated = orderService.updateOrderStatus(orderId, request.getOrderStatus());
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", updated));
    }
}
