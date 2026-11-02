package com.hlptt.controller;

import com.hlptt.dto.ReviewRequestDTO;
import com.hlptt.entity.Review;
import com.hlptt.entity.User;
import com.hlptt.repository.UserRepository;
import com.hlptt.service.ReviewService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    private User getCurrentUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    // [POST] Tạo đánh giá (Yêu cầu đăng nhập)
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Review> createReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ReviewRequestDTO reviewRequest) {

        User user = getCurrentUser(userDetails);
        Review review = reviewService.createReview(user, reviewRequest);
        return ResponseEntity.ok(review);
    }

    // [GET] Xem đánh giá của sản phẩm (Public - Ai cũng xem được)
    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<Review>> getProductReviews(
            @PathVariable Integer productId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<Review> reviews = reviewService.getReviewsByProduct(productId, pageable);
        return ResponseEntity.ok(reviews);
    }
}