package com.hlptt.controller;

import com.hlptt.dto.ChangePasswordRequestDto;
import com.hlptt.dto.UpdateProfileRequestDto;
import com.hlptt.dto.UserRequestDto;
import com.hlptt.entity.User;
import com.hlptt.service.AuthService;
import com.hlptt.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin("*")
@RequestMapping("/api") // Root path để map được cả /users và /user
public class UserController {

    @Autowired
    private UserService userService; // Dùng cho Admin quản lý

    @Autowired
    private AuthService authService; // Dùng cho User tự quản lý

    // ==================================================================
    // PHẦN 1: ADMIN QUẢN LÝ USER (CRUD) -> Path: /api/users
    // ==================================================================

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<User>> getAllUsers(
            Pageable pageable,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(userService.getUsers(keyword, pageable));
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUser(@RequestBody UserRequestDto dto) {
        return ResponseEntity.ok(userService.createUser(dto));
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody UserRequestDto dto) {
        return ResponseEntity.ok(userService.updateUser(id, dto));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Xóa thành công!");
    }

    // ==================================================================
    // PHẦN 2: USER TỰ QUẢN LÝ (PROFILE) -> Path: /api/user
    // ==================================================================

    // API này quan trọng để Dashboard.js check login
    @GetMapping("/user/profile")
    public ResponseEntity<User> getMyProfile() {
        // Lấy email từ Security Context (Token)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        // Gọi service lấy info (Bạn cần đảm bảo UserService có hàm findByEmail)
        // Hoặc dùng tạm logic này nếu chưa có hàm getProfile riêng
        return ResponseEntity.ok(userService.getUserByEmail(email)); 
    }

    @PostMapping("/user/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequestDto dto) {
        authService.changePassword(dto);
        return ResponseEntity.ok("Đổi mật khẩu thành công!");
    }

    @PutMapping("/user/update-profile")
    public ResponseEntity<User> updateProfile(@RequestBody UpdateProfileRequestDto dto) {
        User updated = authService.updateProfile(dto);
        return ResponseEntity.ok(updated);
    }

    @PostMapping(value = "/user/update-avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<User> updateAvatar(@RequestPart("avatar") MultipartFile avatarFile) {
        User updated = authService.updateAvatar(avatarFile);
        return ResponseEntity.ok(updated);
    }
}