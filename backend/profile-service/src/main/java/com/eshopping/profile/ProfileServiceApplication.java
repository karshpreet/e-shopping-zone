package com.eshopping.profile;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Profile and Authentication Microservice for E-Shopping Zone.
 * Manages User registration, login, JWT token issuance, roles, and profiles.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ProfileServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProfileServiceApplication.class, args);
    }
}
