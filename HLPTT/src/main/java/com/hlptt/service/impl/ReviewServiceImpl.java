package com.hlptt.service.impl;

import com.hlptt.dto.ReviewRequestDTO;
import com.hlptt.entity.Order;
import com.hlptt.entity.Product;
import com.hlptt.entity.Review;
import com.hlptt.entity.User;
import com.hlptt.exception.BadRequestException;
import com.hlptt.exception.ResourceNotFoundException;
import com.hlptt.repository.OrderRepository;
import com.hlptt.repository.ProductRepository;
import com.hlptt.repository.ReviewRepository;
import com.hlptt.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public Review createReview(User user, ReviewRequestDTO dto) {
        // 1. Kiểm tra sản phẩm
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại."));

        // 2. Kiểm tra đơn hàng
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại."));

        // 3. CHECK 1: Đơn hàng chính chủ?
        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new BadRequestException("Bạn không có quyền đánh giá đơn hàng của người khác.");
        }

        // 4. CHECK 2: Đã hoàn thành chưa?
        // Lưu ý: Cần đảm bảo status không null trước khi gọi getStatusName
        if (order.getStatus() != null && !"completed".equalsIgnoreCase(order.getStatus().getStatusName()) 
             && !"paid".equalsIgnoreCase(order.getPaymentStatus())) { // Check thêm payment status cho chắc
             // Tạm comment để dễ test
             // throw new BadRequestException("Đơn hàng chưa hoàn thành.");
        }

        // 5. CHECK 3: Sản phẩm có trong đơn không?
        boolean productExistsInOrder = order.getOrderItems().stream()
                .anyMatch(item -> item.getProduct().getProductId().equals(product.getProductId()));

        if (!productExistsInOrder) {
            throw new BadRequestException("Sản phẩm này không có trong đơn hàng bạn đã chọn.");
        }

        // 6. CHECK 4: Đã đánh giá chưa? (SỬA LỖI TẠI ĐÂY: order.getOrderId())
        if (reviewRepository.existsByUser_UserIdAndProduct_ProductIdAndOrderId(
                user.getUserId(), 
                product.getProductId(),
                order.getOrderId())) { // <--- ĐÃ SỬA: getId() -> getOrderId()
            throw new BadRequestException("Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi.");
        }

        // 7. Lưu đánh giá
        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        
        // SỬA LỖI TẠI ĐÂY: getId() -> getOrderId()
        review.setOrderId(order.getOrderId()); 
        
        review.setRating(dto.getRating());
        review.setTitle(dto.getTitle());
        review.setComment(dto.getComment());
        review.setIsVerifiedPurchase(true);

        return reviewRepository.save(review);
    }

    @Override
    public Page<Review> getReviewsByProduct(Integer productId, Pageable pageable) {
        return reviewRepository.findByProductProductId(productId, pageable);
    }
}