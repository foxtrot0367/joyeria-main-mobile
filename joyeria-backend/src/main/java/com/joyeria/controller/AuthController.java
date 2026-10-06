package com.joyeria.controller;

import com.joyeria.dto.*;
import com.joyeria.model.User;
import com.joyeria.service.AuthService;
import com.joyeria.service.GoogleOAuthService;
import com.joyeria.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GoogleOAuthService googleOAuthService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Inicio de sesión exitoso", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registro exitoso", response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(
                "Si el email existe, recibirás un enlace para restablecer tu contraseña", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Contraseña actualizada exitosamente", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(Authentication authentication) {
        User user = authService.getCurrentUser(authentication.getName());
        UserDTO dto = UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .build();
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> loginWithGoogle(@RequestBody GoogleAuthRequest request) {
        AuthResponse response = authService.loginWithGoogle(
                request.getEmail(),
                request.getGoogleId(),
                request.getFirstName(),
                request.getLastName()
        );
        return ResponseEntity.ok(ApiResponse.success("Inicio de sesión con Google exitoso", response));
    }

    @GetMapping("/google/callback")
    public ResponseEntity<ApiResponse<AuthResponse>> googleCallback(
            @AuthenticationPrincipal OAuth2User oauth2User) {
        AuthResponse response = googleOAuthService.authenticateGoogleUser(oauth2User.getAttributes());
        return ResponseEntity.ok(ApiResponse.success("Inicio de sesión con Google exitoso", response));
    }
}