package com.eshopping.wallet.dto;

import java.math.BigDecimal;

public class WalletDto {

    private Long id;
    private Long userId;
    private BigDecimal balance;
    private String currency;
    private String status;

    public WalletDto() {
    }

    public WalletDto(Long id, Long userId, BigDecimal balance, String currency, String status) {
        this.id = id;
        this.userId = userId;
        this.balance = balance;
        this.currency = currency;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
