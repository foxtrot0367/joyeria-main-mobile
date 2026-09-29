package com.joyeria.service;

import com.joyeria.dto.*;
import com.joyeria.exception.ResourceNotFoundException;
import com.joyeria.model.Coupon;
import com.joyeria.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    public List<CouponDTO> getAllCoupons() {
        return couponRepository.findAll().stream().map(this::mapToDTO).toList();
    }

    public CouponDTO getCouponById(Long id) {
        return mapToDTO(couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cupón no encontrado")));
    }

    public CouponDTO validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new ResourceNotFoundException("Cupón no válido o inactivo"));

        if (coupon.getValidFrom() != null && java.time.LocalDateTime.now().isBefore(coupon.getValidFrom())) {
            throw new IllegalStateException("El cupón aún no está activo");
        }
        if (coupon.getValidUntil() != null && java.time.LocalDateTime.now().isAfter(coupon.getValidUntil())) {
            throw new IllegalStateException("El cupón ha expirado");
        }
        if (coupon.getMaxUses() != null && coupon.getUsesCount() >= coupon.getMaxUses()) {
            throw new IllegalStateException("El cupón ha alcanzado su límite de uso");
        }

        return mapToDTO(coupon);
    }

    public CouponDTO createCoupon(CouponCreateRequest request) {
        if (couponRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new IllegalArgumentException("El código del cupón ya existe");
        }
        Coupon coupon = new Coupon();
        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDescription(request.getDescription());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinAmount(request.getMinAmount());
        coupon.setMaxUses(request.getMaxUses());
        coupon.setValidFrom(request.getValidFrom());
        coupon.setValidUntil(request.getValidUntil());
        coupon.setActive(true);
        return mapToDTO(couponRepository.save(coupon));
    }

    public CouponDTO updateCoupon(Long id, CouponCreateRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cupón no encontrado"));
        if (request.getDescription() != null) coupon.setDescription(request.getDescription());
        if (request.getDiscountValue() != null) coupon.setDiscountValue(request.getDiscountValue());
        if (request.getValidFrom() != null) coupon.setValidFrom(request.getValidFrom());
        if (request.getValidUntil() != null) coupon.setValidUntil(request.getValidUntil());
        return mapToDTO(couponRepository.save(coupon));
    }

    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }

    private CouponDTO mapToDTO(Coupon coupon) {
        return CouponDTO.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType().name())
                .discountValue(coupon.getDiscountValue())
                .minAmount(coupon.getMinAmount())
                .maxUses(coupon.getMaxUses())
                .usesCount(coupon.getUsesCount())
                .validFrom(coupon.getValidFrom())
                .validUntil(coupon.getValidUntil())
                .active(coupon.getActive())
                .build();
    }
}
