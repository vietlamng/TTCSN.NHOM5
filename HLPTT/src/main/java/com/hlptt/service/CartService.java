package com.hlptt.service;

import com.hlptt.dto.AddItemRequestDto;
import com.hlptt.entity.Cart;
import com.hlptt.entity.CartItem;
import com.hlptt.entity.Product;
import com.hlptt.entity.User;
import com.hlptt.exception.ResourceNotFoundException;
import com.hlptt.repository.CartItemRepository;
import com.hlptt.repository.CartRepository;
import com.hlptt.repository.ProductRepository;
import com.hlptt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Lấy user đang đăng nhập từ Spring Security Context.
     */
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với email: " + email));
    }

    /**
     * Lấy giỏ hàng của user, nếu chưa có thì tạo mới.
     * Hàm này cũng ép tải (eagerly load) các thông tin cần thiết.
     */
    private Cart getOrCreateCart(User user) {
        Optional<Cart> optionalCart = cartRepository.findByUserUserId(user.getUserId());
        Cart cart;

        if (optionalCart.isPresent()) {
            cart = optionalCart.get();
        } else {
            // Nếu user chưa có giỏ hàng, tạo mới
            Cart newCart = new Cart();
            newCart.setUser(user);
            cart = cartRepository.save(newCart);
        }

        // --- SỬA LỖI QUAN TRỌNG NHẤT (NPE / error: null) ---
        // Ép Hibernate tải collection VÀ các product bên trong
        // Điều này đảm bảo khi OrderService gọi, dữ liệu đã sẵn sàng.
        for (CartItem item : cart.getCartItems()) {
            item.getProduct().getProductName(); // "Touch" the product
        }

        return cart;
    }

    @Transactional
    public Cart getCartForCurrentUser() {
        User user = getCurrentUser();
        // getOrCreateCart đã bao gồm logic sửa lỗi
        return getOrCreateCart(user);
    }

    @Transactional
    public Cart addItemToCart(AddItemRequestDto itemDto) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user); // Lấy cart (đã được fix lazy loading)

        Product product = productRepository.findById(itemDto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy sản phẩm với ID: " + itemDto.getProductId()));

        Optional<CartItem> optionalItem = cartItemRepository.findByCartCartIdAndProductProductId(
                cart.getCartId(),
                itemDto.getProductId());

        if (optionalItem.isPresent()) {
            CartItem existingItem = optionalItem.get();
            existingItem.setQuantity(existingItem.getQuantity() + itemDto.getQuantity());
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(itemDto.getQuantity());

            BigDecimal price = (product.getSalePrice() != null) ? product.getSalePrice() : product.getPrice();
            newItem.setPrice(price);

            cartItemRepository.save(newItem);
        }

        // Tải lại cart để lấy dữ liệu mới nhất
        // Dùng getOrCreateCart để đảm bảo fix lazy loading vẫn được áp dụng
        return getOrCreateCart(user);
    }

    @Transactional
    public Cart updateItemQuantity(Integer productId, Integer quantity) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user); // Lấy cart (đã được fix lazy loading)

        CartItem item = cartItemRepository.findByCartCartIdAndProductProductId(cart.getCartId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm này trong giỏ hàng"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        // Tải lại cart
        return getOrCreateCart(user);
    }

    @Transactional
    public Cart removeItemFromCart(Integer productId) {
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user); // Lấy cart (đã được fix lazy loading)

        CartItem item = cartItemRepository.findByCartCartIdAndProductProductId(cart.getCartId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm này trong giỏ hàng"));

        cartItemRepository.delete(item);

        // Tải lại cart
        return getOrCreateCart(user);
    }
}