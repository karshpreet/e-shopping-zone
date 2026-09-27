package com.eshopping.cart.dto;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

public class UpdateCartItemRequest {
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    public UpdateCartItemRequest() {}
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
