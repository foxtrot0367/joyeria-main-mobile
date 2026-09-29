package com.joyeria.controller;

import com.joyeria.dto.*;
import com.joyeria.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin
public class AdminReviewController {

    private final ReviewService reviewService;

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ReviewDTO>> moderate(
            @PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Reseña moderada", reviewService.moderateReview(id, status)));
    }
}