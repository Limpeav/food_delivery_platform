package com.example.fooddelivery.auth.service;

import com.example.fooddelivery.auth.dto.GoogleUserInfo;

public interface GoogleAuthService {
    /**
     * Verifies the Google ID token and returns the verified user information.
     *
     * @param idToken the Google ID token
     * @return verified Google user information
     * @throws com.example.fooddelivery.common.exception.UnauthorizedException if invalid or unverified
     */
    GoogleUserInfo verifyToken(String idToken);
}
