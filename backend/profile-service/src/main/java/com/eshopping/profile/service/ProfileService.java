package com.eshopping.profile.service;

import com.eshopping.profile.dto.UpdateProfileRequest;
import com.eshopping.profile.dto.UserProfileDto;
import com.eshopping.profile.entity.Profile;
import com.eshopping.profile.entity.User;
import com.eshopping.profile.exception.ResourceNotFoundException;
import com.eshopping.profile.repository.ProfileRepository;
import com.eshopping.profile.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    public UserProfileDto getProfileByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Profile p = new Profile(userId, user.getUsername(), null, null, null, null, null);
                    return profileRepository.save(p);
                });

        return mapToDto(user, profile);
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> new Profile(userId, user.getUsername(), null, null, null, null, null));

        if (request.getFullName() != null) profile.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) profile.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddressLine1() != null) profile.setAddressLine1(request.getAddressLine1());
        if (request.getAddressLine2() != null) profile.setAddressLine2(request.getAddressLine2());
        if (request.getCity() != null) profile.setCity(request.getCity());
        if (request.getState() != null) profile.setState(request.getState());
        if (request.getPostalCode() != null) profile.setPostalCode(request.getPostalCode());
        if (request.getCountry() != null) profile.setCountry(request.getCountry());
        if (request.getAvatarUrl() != null) profile.setAvatarUrl(request.getAvatarUrl());

        Profile updatedProfile = profileRepository.save(profile);
        return mapToDto(user, updatedProfile);
    }

    private UserProfileDto mapToDto(User user, Profile profile) {
        UserProfileDto dto = new UserProfileDto();
        dto.setUserId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setFullName(profile.getFullName());
        dto.setPhoneNumber(profile.getPhoneNumber());
        dto.setAddressLine1(profile.getAddressLine1());
        dto.setAddressLine2(profile.getAddressLine2());
        dto.setCity(profile.getCity());
        dto.setState(profile.getState());
        dto.setPostalCode(profile.getPostalCode());
        dto.setCountry(profile.getCountry());
        dto.setAvatarUrl(profile.getAvatarUrl());
        return dto;
    }
}
