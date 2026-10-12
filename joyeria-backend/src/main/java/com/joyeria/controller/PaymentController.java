package com.joyeria.controller;

import com.joyeria.dto.ApiResponse;
import com.joyeria.dto.CheckoutResponse;
import com.joyeria.dto.PaymentRequest;
import com.joyeria.dto.PaymentStatusDTO;
import com.joyeria.dto.SandboxConfirmRequest;
import com.joyeria.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<CheckoutResponse>> createCheckout(
            @Valid @RequestBody PaymentRequest request, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Checkout creado",
                paymentService.createCheckout(authentication.getName(), request)));
    }

    /**
     * Webhook público de Mercado Pago. La autenticidad se verifica con la firma
     * HMAC (x-signature) y el monto se reconcilia antes de aprobar el pedido.
     */
    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<Void>> webhook(
            @RequestHeader(value = "x-signature", required = false) String xSignature,
            @RequestHeader(value = "x-request-id", required = false) String xRequestId,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "data.id", required = false) String dataId,
            @RequestBody(required = false) Map<String, Object> body) {
        paymentService.handleMercadoPagoWebhook(xSignature, xRequestId, dataId, type, body);
        return ResponseEntity.ok(ApiResponse.success("Notificación procesada", null));
    }

    /** Confirmación del flujo sandbox (solo desarrollo). */
    @PostMapping("/sandbox/confirm")
    public ResponseEntity<ApiResponse<PaymentStatusDTO>> confirmSandbox(
            @Valid @RequestBody SandboxConfirmRequest request, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Pago confirmado",
                paymentService.confirmSandbox(authentication.getName(), request.getReference())));
    }

    @GetMapping("/status/{orderNumber}")
    public ResponseEntity<ApiResponse<PaymentStatusDTO>> status(
            @PathVariable String orderNumber, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getPaymentStatus(orderNumber, authentication.getName(), isAdmin)));
    }
}
