package com.eshopping.order.dto;

import javax.validation.constraints.NotBlank;

public class UpdateOrderStatusRequest {

    @NotBlank(message = "Order status is required ('PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')")
    private String orderStatus;

    public UpdateOrderStatusRequest() {
    }

    public UpdateOrderStatusRequest(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }
}
