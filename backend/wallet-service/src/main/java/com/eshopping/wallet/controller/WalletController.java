package com.eshopping.wallet.controller;

import com.eshopping.wallet.dto.*;
import com.eshopping.wallet.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<WalletDto>> getWallet(@PathVariable Long userId) {
        WalletDto wallet = walletService.getWalletDto(userId);
        return ResponseEntity.ok(ApiResponse.success("Wallet retrieved successfully", wallet));
    }

    @GetMapping("/{userId}/balance")
    public ResponseEntity<ApiResponse<BigDecimal>> getBalance(@PathVariable Long userId) {
        BigDecimal balance = walletService.getBalance(userId);
        return ResponseEntity.ok(ApiResponse.success("Balance retrieved successfully", balance));
    }

    @PostMapping("/{userId}/topup")
    public ResponseEntity<ApiResponse<WalletTransactionDto>> topup(
            @PathVariable Long userId,
            @Valid @RequestBody TopupRequest request) {
        WalletTransactionDto txn = walletService.topup(userId, request);
        return new ResponseEntity<>(ApiResponse.success("Wallet top-up successful", txn), HttpStatus.CREATED);
    }

    @PostMapping("/{userId}/deduct")
    public ResponseEntity<ApiResponse<WalletTransactionDto>> deduct(
            @PathVariable Long userId,
            @Valid @RequestBody DeductRequest request) {
        WalletTransactionDto txn = walletService.deduct(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Wallet deduction successful", txn));
    }

    @PostMapping("/{userId}/pay")
    public ResponseEntity<ApiResponse<WalletTransactionDto>> pay(
            @PathVariable Long userId,
            @Valid @RequestBody DeductRequest request) {
        WalletTransactionDto txn = walletService.deduct(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment completed successfully", txn));
    }

    @GetMapping("/{userId}/transactions")
    public ResponseEntity<ApiResponse<List<WalletTransactionDto>>> getTransactions(@PathVariable Long userId) {
        List<WalletTransactionDto> txns = walletService.getTransactions(userId);
        return ResponseEntity.ok(ApiResponse.success("Transactions retrieved successfully", txns));
    }

    // Header-based endpoints for convenience
    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<BigDecimal>> getBalanceByHeader(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) userId = 1L;
        BigDecimal balance = walletService.getBalance(userId);
        return ResponseEntity.ok(ApiResponse.success("Balance retrieved successfully", balance));
    }

    @PostMapping("/topup")
    public ResponseEntity<ApiResponse<WalletTransactionDto>> topupByHeader(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody TopupRequest request) {
        if (userId == null) userId = 1L;
        WalletTransactionDto txn = walletService.topup(userId, request);
        return new ResponseEntity<>(ApiResponse.success("Wallet top-up successful", txn), HttpStatus.CREATED);
    }

    @PostMapping("/pay")
    public ResponseEntity<ApiResponse<WalletTransactionDto>> payByHeader(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody DeductRequest request) {
        if (userId == null) userId = 1L;
        WalletTransactionDto txn = walletService.deduct(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment completed successfully", txn));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<WalletTransactionDto>>> getTransactionsByHeader(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) userId = 1L;
        List<WalletTransactionDto> txns = walletService.getTransactions(userId);
        return ResponseEntity.ok(ApiResponse.success("Transactions retrieved successfully", txns));
    }
}
