package com.eshopping.wallet.service;

import com.eshopping.wallet.dto.*;
import com.eshopping.wallet.entity.Wallet;
import com.eshopping.wallet.entity.WalletTransaction;
import com.eshopping.wallet.exception.BadRequestException;
import com.eshopping.wallet.exception.InsufficientBalanceException;
import com.eshopping.wallet.repository.WalletRepository;
import com.eshopping.wallet.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WalletService {

    private static final BigDecimal INITIAL_WELCOME_BALANCE = new BigDecimal("5000.00");

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Transactional
    public Wallet getOrCreateWallet(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Wallet newWallet = new Wallet(userId, INITIAL_WELCOME_BALANCE, "INR");
                    Wallet saved = walletRepository.save(newWallet);

                    // Create welcome bonus transaction
                    String txnId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                    WalletTransaction initialTxn = new WalletTransaction(
                            txnId,
                            saved,
                            userId,
                            INITIAL_WELCOME_BALANCE,
                            "CREDIT",
                            "SUCCESS",
                            "SIGNUP-BONUS",
                            "Welcome credit for testing and evaluation"
                    );
                    walletTransactionRepository.save(initialTxn);
                    return saved;
                });
    }

    public WalletDto getWalletDto(Long userId) {
        Wallet wallet = getOrCreateWallet(userId);
        return mapToDto(wallet);
    }

    public BigDecimal getBalance(Long userId) {
        Wallet wallet = getOrCreateWallet(userId);
        return wallet.getBalance();
    }

    @Transactional
    public WalletTransactionDto topup(Long userId, TopupRequest request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Top-up amount must be greater than zero");
        }

        Wallet wallet = getOrCreateWallet(userId);
        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        walletRepository.save(wallet);

        String txnId = "TXN-CR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String ref = request.getPaymentReference() != null ? request.getPaymentReference() : "TOPUP-" + System.currentTimeMillis();
        String desc = request.getDescription() != null ? request.getDescription() : "Wallet balance top-up";

        WalletTransaction txn = new WalletTransaction(
                txnId,
                wallet,
                userId,
                request.getAmount(),
                "CREDIT",
                "SUCCESS",
                ref,
                desc
        );

        WalletTransaction savedTxn = walletTransactionRepository.save(txn);
        return mapTxnToDto(savedTxn);
    }

    @Transactional
    public WalletTransactionDto deduct(Long userId, DeductRequest request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Deduction amount must be greater than zero");
        }

        Wallet wallet = getOrCreateWallet(userId);

        if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
            // Record failed transaction attempt
            String failedTxnId = "TXN-FAIL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            WalletTransaction failedTxn = new WalletTransaction(
                    failedTxnId,
                    wallet,
                    userId,
                    request.getAmount(),
                    "DEBIT",
                    "FAILED",
                    request.getOrderReference(),
                    "Failed payment: Insufficient funds (Available: " + wallet.getBalance() + ")"
            );
            walletTransactionRepository.save(failedTxn);

            throw new InsufficientBalanceException(wallet.getBalance(), request.getAmount());
        }

        wallet.setBalance(wallet.getBalance().subtract(request.getAmount()));
        walletRepository.save(wallet);

        String txnId = "TXN-DB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String ref = request.getOrderReference() != null ? request.getOrderReference() : "ORDER-" + System.currentTimeMillis();
        String desc = request.getDescription() != null ? request.getDescription() : "Payment deduction for order";

        WalletTransaction txn = new WalletTransaction(
                txnId,
                wallet,
                userId,
                request.getAmount(),
                "DEBIT",
                "SUCCESS",
                ref,
                desc
        );

        WalletTransaction savedTxn = walletTransactionRepository.save(txn);
        return mapTxnToDto(savedTxn);
    }

    public List<WalletTransactionDto> getTransactions(Long userId) {
        getOrCreateWallet(userId); // ensure wallet exists
        return walletTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapTxnToDto)
                .collect(Collectors.toList());
    }

    private WalletDto mapToDto(Wallet wallet) {
        return new WalletDto(
                wallet.getId(),
                wallet.getUserId(),
                wallet.getBalance(),
                wallet.getCurrency(),
                wallet.getStatus()
        );
    }

    private WalletTransactionDto mapTxnToDto(WalletTransaction txn) {
        WalletTransactionDto dto = new WalletTransactionDto();
        dto.setId(txn.getId());
        dto.setTransactionId(txn.getTransactionId());
        if (txn.getWallet() != null) {
            dto.setWalletId(txn.getWallet().getId());
        }
        dto.setUserId(txn.getUserId());
        dto.setAmount(txn.getAmount());
        dto.setType(txn.getType());
        dto.setStatus(txn.getStatus());
        dto.setReferenceId(txn.getReferenceId());
        dto.setDescription(txn.getDescription());
        dto.setCreatedAt(txn.getCreatedAt());
        return dto;
    }
}
