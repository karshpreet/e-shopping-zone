package com.eshopping.profile.service;

import com.eshopping.profile.dto.AuthResponse;
import com.eshopping.profile.dto.LoginRequest;
import com.eshopping.profile.dto.RegisterRequest;
import com.eshopping.profile.entity.Profile;
import com.eshopping.profile.entity.Role;
import com.eshopping.profile.entity.User;
import com.eshopping.profile.exception.BadRequestException;
import com.eshopping.profile.exception.UnauthorizedException;
import com.eshopping.profile.repository.ProfileRepository;
import com.eshopping.profile.repository.UserRepository;
import com.eshopping.profile.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username '" + request.getUsername() + "' is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email '" + request.getEmail() + "' is already registered");
        }

        Role userRole = request.getRole() != null ? request.getRole() : Role.CUSTOMER;

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                userRole
        );
        User savedUser = userRepository.save(user);

        // Create initial Profile
        String fullName = request.getFullName() != null && !request.getFullName().trim().isEmpty() 
                ? request.getFullName() : request.getUsername();
        Profile profile = new Profile(
                savedUser.getId(),
                fullName,
                request.getPhoneNumber(),
                request.getAddressLine1(),
                request.getCity(),
                request.getState(),
                request.getPostalCode()
        );
        profileRepository.save(profile);

        String token = tokenProvider.generateToken(savedUser);
        return new AuthResponse(token, savedUser.getId(), savedUser.getUsername(), savedUser.getEmail(), savedUser.getRole(), fullName);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameOrEmail(request.getUsernameOrEmail(), request.getUsernameOrEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid username/email or password"));

        if (!user.getActive()) {
            throw new UnauthorizedException("User account is inactive or disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid username/email or password");
        }

        String fullName = profileRepository.findByUserId(user.getId())
                .map(Profile::getFullName)
                .orElse(user.getUsername());

        String token = tokenProvider.generateToken(user);
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getRole(), fullName);
    }
}
