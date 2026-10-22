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

@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@hlptt.com";
        String adminPassword = "123456"; // Mật khẩu bạn muốn

        // 1. Tìm Role Admin (hoặc tạo mới nếu chưa có)
        Role adminRole = roleRepository.findByRoleName("ADMIN")
                .or(() -> roleRepository.findByRoleName("admin"))
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setRoleName("ADMIN");
                    newRole.setDescription("Quản trị viên hệ thống");
                    return roleRepository.save(newRole);
                });

        // 2. Tìm User Admin (nếu chưa có thì tạo object mới)
        User adminUser = userRepository.findByEmail(adminEmail).orElse(new User());

        // 3. Cập nhật thông tin (Luôn ghi đè để đảm bảo mật khẩu đúng)
        adminUser.setEmail(adminEmail);
        adminUser.setFullName("Super Admin");
        adminUser.setPhone("0999999999");
        
        // QUAN TRỌNG: Mã hóa mật khẩu trước khi lưu
        adminUser.setPasswordHash(passwordEncoder.encode(adminPassword));
        
        adminUser.setRole(adminRole);
        adminUser.setIsActive(true);
        adminUser.setEmailVerified(true);

        // 4. Lưu xuống Database
        userRepository.save(adminUser);

        log.info("==============================================");
        log.info(">>> ADMIN SETUP SUCCESSFUL");
        log.info(">>> Email: {}", adminEmail);
        log.info(">>> Pass : {}", adminPassword);
        log.info("==============================================");
    }
}