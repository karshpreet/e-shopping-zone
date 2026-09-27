package com.eshopping.wallet.dto;

import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

public class DeductRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Deduct amount must be greater than 0")
    private BigDecimal amount;

    private String orderReference;
    private String description;

    public DeductRequest() {
    }

    public DeductRequest(BigDecimal amount, String orderReference, String description) {
        this.amount = amount;
        this.orderReference = orderReference;
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getOrderReference() {
        return orderReference;
    }

    public void setOrderReference(String orderReference) {
        this.orderReference = orderReference;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
