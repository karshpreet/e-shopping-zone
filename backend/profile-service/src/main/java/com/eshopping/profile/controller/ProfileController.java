package com.eshopping.profile.controller;

import com.eshopping.profile.dto.ApiResponse;
import com.eshopping.profile.dto.UpdateProfileRequest;
import com.eshopping.profile.dto.UserProfileDto;
import com.eshopping.profile.exception.UnauthorizedException;
import com.eshopping.profile.security.UserPrincipal;
import com.eshopping.profile.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        // Validate that user can only access their own profile (or is merchant/admin)
        if (currentUser != null && !currentUser.getId().equals(userId)) {
            boolean isMerchant = currentUser.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_MERCHANT"));
            if (!isMerchant) {
                throw new UnauthorizedException("You are not authorized to view another user's profile");
            }
        }

        UserProfileDto profileDto = profileService.getProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", profileDto));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser != null && !currentUser.getId().equals(userId)) {
            throw new UnauthorizedException("You can only modify your own profile");
        }

        UserProfileDto updated = profileService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }
}
