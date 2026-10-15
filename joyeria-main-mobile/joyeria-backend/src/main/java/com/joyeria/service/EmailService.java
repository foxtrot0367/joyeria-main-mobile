package com.joyeria.service;

import com.joyeria.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${email.api-key:}")
    private String apiKey;

    @Value("${email.from}")
    private String from;

    public void sendPasswordReset(User user, String token) {
        String link = frontendUrl + "/restablecer-contrasena?token=" + token;
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("EMAIL_DEV_MODE | EMAIL_API_KEY no configurado. Recuperación de contraseña para {}:", user.getEmail());
            log.warn("Enlace de restablecimiento (expira en 2 horas):\n{}", link);
            return;
        }
        // Integración real con proveedor de email (p. ej. Resend/SendGrid). Envío pendiente de
        // implementación del transporte usando EMAIL_API_KEY. Mientras tanto se registra el enlace.
        log.info("Enviando email de recuperación a {} desde {}", user.getEmail(), from);
        log.info("Enlace de restablecimiento (expira en 2 horas):\n{}", link);
    }
}