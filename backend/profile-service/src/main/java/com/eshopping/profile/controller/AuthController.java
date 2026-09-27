package com.eshopping.profile.controller;

import com.eshopping.profile.dto.ApiResponse;
import com.eshopping.profile.dto.AuthResponse;
import com.eshopping.profile.dto.LoginRequest;
import com.eshopping.profile.dto.RegisterRequest;
import com.eshopping.profile.security.JwtTokenProvider;
import com.eshopping.profile.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(ApiResponse.success("User registered successfully", response), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            boolean isValid = tokenProvider.validateToken(token);
            if (isValid) {
                return ResponseEntity.ok(ApiResponse.success("Token is valid", true));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Token is invalid or expired"));
    }
}
