package com.joyeria.controller;

import com.joyeria.dto.*;
import com.joyeria.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<ApiResponse<Map<String, Object>>> processPayment(
            @Valid @RequestBody PaymentRequest request, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Pago procesado",
                paymentService.processPayment(authentication.getName(), request)));
    }

    @GetMapping("/reference/{reference}")
    public ResponseEntity<ApiResponse<PaymentService.PaymentDTO>> getByReference(
            @PathVariable String reference, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getPaymentByReference(authentication.getName(), reference)));
    }
}
