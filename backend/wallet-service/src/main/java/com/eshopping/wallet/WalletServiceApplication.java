package com.eshopping.wallet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Wallet Microservice for E-Shopping Zone.
 * Manages customer balances, ledger transactions, and payment deductions.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class WalletServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(WalletServiceApplication.class, args);
    }
}
