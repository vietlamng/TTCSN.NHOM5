package com.hlptt.controller;

import com.hlptt.dto.AddItemRequestDto;
import com.hlptt.entity.Cart;
import com.hlptt.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Map;

@RestController
@CrossOrigin("*")
@RequestMapping("/api/cart")
@PreAuthorize("isAuthenticated()")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<Cart> getMyCart() {
        Cart cart = cartService.getCartForCurrentUser();
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addItemToCart(@RequestBody AddItemRequestDto itemDto) {
        Cart updatedCart = cartService.addItemToCart(itemDto);
        return ResponseEntity.ok(updatedCart);
    }

    @PutMapping("/update")
    public ResponseEntity<Cart> updateItemQuantity(
            @RequestParam Integer productId,
            @RequestParam Integer quantity) {

        Cart updatedCart = cartService.updateItemQuantity(productId, quantity);
        return ResponseEntity.ok(updatedCart);
    }

    @DeleteMapping("/remove")
    public ResponseEntity<Cart> removeItemFromCart(@RequestParam Integer productId) {
        Cart updatedCart = cartService.removeItemFromCart(productId);
        return ResponseEntity.ok(updatedCart);
    }
}