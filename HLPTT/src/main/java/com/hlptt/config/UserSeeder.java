package com.hlptt.config;

import com.hlptt.entity.Role;
import com.hlptt.entity.User;
import com.hlptt.repository.RoleRepository;
import com.hlptt.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class UserSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(UserSeeder.class);

    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Kiểm tra xem đã có data chưa, nếu số lượng user lớn hơn 5 thì không seed nữa
        if (userRepository.count() > 5) {
            log.info(">>> Đã có sẵn dữ liệu User, bỏ qua bước tạo 100 User mẫu.");
            return;
        }

        // 1. Tìm Role USER (hoặc tạo mới nếu chưa có)
        Role userRole = roleRepository.findByRoleName("USER")
                .or(() -> roleRepository.findByRoleName("user"))
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setRoleName("USER");
                    newRole.setDescription("Người dùng bình thường");
                    return roleRepository.save(newRole);
                });

        // 2. Mã hóa mật khẩu mặc định "123456" MỘT LẦN duy nhất để dùng chung cho 100 người
        String defaultPasswordHash = passwordEncoder.encode("123456");

        // 3. Tạo vòng lặp sinh 100 User
        List<User> usersToSave = new ArrayList<>();
        
        for (int i = 1; i <= 100; i++) {
            User u = new User();
            u.setEmail("user" + i + "@gmail.com");
            u.setFullName("Người Dùng Mẫu " + i);
            
            // Random sđt kiểu 0987654301, 0987654302...
            u.setPhone("098765" + String.format("%04d", i));
            
            // Set mật khẩu đã được băm (hash)
            u.setPasswordHash(defaultPasswordHash);
            
            u.setRole(userRole);
            u.setIsActive(true);
            u.setEmailVerified(true); // Đã verify luôn để test cho nhanh
            
            usersToSave.add(u);
        }

        // 4. Lưu tất cả vào Database
        userRepository.saveAll(usersToSave);

        log.info("==============================================");
        log.info(">>> TẠO THÀNH CÔNG 100 USER MẪU");
        log.info(">>> Email: user1@gmail.com -> user100@gmail.com");
        log.info(">>> Pass chung: 123456");
        log.info("==============================================");
    }
}
