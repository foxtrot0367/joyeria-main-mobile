package com.joyeria.service;

import com.joyeria.dto.*;
import com.joyeria.exception.ResourceNotFoundException;
import com.joyeria.model.*;
import com.joyeria.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public Map<String, Object> processPayment(String userEmail, PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));
        if (!order.getUser().getEmail().equals(userEmail)) {
            throw new ResourceNotFoundException("Pedido no encontrado");
        }

        Optional<Payment> existingApproved = paymentRepository.findByOrderId(order.getId()).stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.APPROVED)
                .findFirst();
        if (existingApproved.isPresent()) {
            return buildResponse(existingApproved.get());
        }

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalStateException("El pedido no está pendiente de pago");
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setProvider("sandbox");
        payment.setProviderReference("PAY-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setAmount(order.getTotal());
        payment.setCurrency("COP");
        payment.setStatus(Payment.PaymentStatus.APPROVED);

        payment = paymentRepository.save(payment);

        order.setStatus(Order.OrderStatus.PAID);
        order.setPaymentStatus(Order.PaymentStatus.COMPLETED);
        order.setPaymentMethod(request.getPaymentMethod());
        orderRepository.save(order);

        return buildResponse(payment);
    }

    public PaymentDTO getPaymentByReference(String userEmail, String reference) {
        Payment payment = paymentRepository.findByProviderReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado"));
        if (!payment.getOrder().getUser().getEmail().equals(userEmail)) {
            throw new ResourceNotFoundException("Pago no encontrado");
        }
        return PaymentDTO.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .provider(payment.getProvider())
                .providerReference(payment.getProviderReference())
                .paymentMethod(payment.getPaymentMethod())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus().name())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    private Map<String, Object> buildResponse(Payment payment) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "approved");
        response.put("reference", payment.getProviderReference());
        response.put("amount", payment.getAmount());
        response.put("currency", payment.getCurrency());
        response.put("message", "Pago procesado exitosamente");
        return response;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class PaymentDTO {
        private Long id;
        private Long orderId;
        private String provider;
        private String providerReference;
        private String paymentMethod;
        private BigDecimal amount;
        private String currency;
        private String status;
        private java.time.LocalDateTime createdAt;
    }
}
