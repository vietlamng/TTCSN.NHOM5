package com.hlptt.service;

import com.hlptt.dto.ReviewRequestDTO;
import com.hlptt.entity.Review;
import com.hlptt.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    // Tạo đánh giá mới
    Review createReview(User user, ReviewRequestDTO reviewRequest);

    // Lấy danh sách đánh giá của một sản phẩm (phân trang)
    Page<Review> getReviewsByProduct(Integer productId, Pageable pageable);
}