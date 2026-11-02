package com.hlptt.repository;

import com.hlptt.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Integer> {

    // Lấy danh sách đánh giá của một sản phẩm (để hiện lên trang chi tiết sản phẩm)
    Page<Review> findByProductProductId(Integer productId, Pageable pageable);

    // Kiểm tra xem user đã đánh giá sản phẩm này trong đơn hàng này chưa
    // (Mỗi sản phẩm trong 1 đơn hàng chỉ được đánh giá 1 lần)
    boolean existsByUser_UserIdAndProduct_ProductIdAndOrderId(Integer userId, Integer productId, Integer orderId);
}