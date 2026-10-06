package com.joyeria.service;

import com.joyeria.dto.AuthResponse;
import com.joyeria.model.User;
import com.joyeria.model.UserRole;
import com.joyeria.repository.UserRepository;
import com.joyeria.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse authenticateGoogleUser(Map<String, Object> attributes) {
        String email = (String) attributes.get("email");
        String googleId = (String) attributes.get("sub");
        String firstName = (String) attributes.get("given_name");
        String lastName = (String) attributes.get("family_name");

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setFirstName(firstName != null ? firstName : "Google");
                    newUser.setLastName(lastName != null ? lastName : "User");
                    newUser.setEmail(email);
                    newUser.setGoogleId(googleId);
                    newUser.setPhone("");
                    newUser.setPassword("");
                    newUser.setRole(UserRole.USER);
                    newUser.setActive(true);
                    return userRepository.save(newUser);
                });

        if (!user.getActive()) {
            throw new IllegalStateException("Usuario desactivado");
        }

        if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
            user = userRepository.save(user);
        }

        String token = tokenProvider.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
