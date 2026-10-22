package com.hlptt.service;

import com.hlptt.dto.UserRequestDto;
import com.hlptt.entity.Role;
import com.hlptt.entity.User;
import com.hlptt.exception.ResourceNotFoundException;
import com.hlptt.repository.RoleRepository;
import com.hlptt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // 1. Lấy danh sách (Có tìm kiếm)
    public Page<User> getUsers(String keyword, Pageable pageable) {
        if (StringUtils.hasText(keyword)) {
            return userRepository.findByEmailContainingOrFullNameContaining(keyword, keyword, pageable);
        }
        return userRepository.findAll(pageable);
    }

    // 2. Chi tiết
    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy User ID: " + id));
    }

    // 3. Tạo mới (Admin)
    public User createUser(UserRequestDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email đã tồn tại!");
        }
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        
        // Gán Role
        Role role = roleRepository.findById(dto.getRoleId() != null ? dto.getRoleId() : 2) // Mặc định role 2 (User)
                .orElseThrow(() -> new RuntimeException("Role không tồn tại"));
        user.setRole(role);

        return userRepository.save(user);
    }

    // 4. Cập nhật
    public User updateUser(Integer id, UserRequestDto dto) {
        User user = getUserById(id);
        
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        
        if (dto.getIsActive() != null) user.setIsActive(dto.getIsActive());
        
        if (dto.getRoleId() != null) {
            Role role = roleRepository.findById(dto.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role không tồn tại"));
            user.setRole(role);
        }

        // Nếu có nhập password mới thì đổi, không thì giữ nguyên
        if (StringUtils.hasText(dto.getPassword())) {
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }

        return userRepository.save(user);
    }

    // 5. Xóa
    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) throw new ResourceNotFoundException("User không tồn tại");
        userRepository.deleteById(id);
    }

    public User getUserByEmail(String email) {
    return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
}
}