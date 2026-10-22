package com.hlptt.service;

import com.hlptt.dto.ChangePasswordRequestDto;
import com.hlptt.dto.ForgotPasswordRequestDto;
import com.hlptt.dto.LoginRequestDto;
import com.hlptt.dto.LoginResponseDto;
import com.hlptt.dto.RegisterRequestDto;
import com.hlptt.dto.ResetPasswordRequestDto;
import com.hlptt.dto.UpdateProfileRequestDto;
import com.hlptt.dto.VerifyOtpRequestDto;
import com.hlptt.entity.Role;
import com.hlptt.entity.User;
import com.hlptt.exception.BadRequestException;
import com.hlptt.exception.ResourceNotFoundException;
import com.hlptt.exception.UnauthorizedException;
import com.hlptt.repository.RoleRepository;
import com.hlptt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CloudinaryService cloudinaryService;

    // ========== ĐĂNG KÝ ==========

    public User registerLocalUser(RegisterRequestDto dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new BadRequestException("Email đã tồn tại");
        }

        Role customerRole = roleRepository.findById(2)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vai trò 'customer'."));

        String otp = generateOtp();

        User newUser = new User();
        newUser.setFullName(dto.getFullName());
        newUser.setPhone(dto.getPhone());
        newUser.setEmail(dto.getEmail());
        newUser.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        newUser.setRole(customerRole);
        newUser.setIsActive(false);
        newUser.setEmailVerified(false);
        newUser.setVerificationCode(otp);
        newUser.setCodeExpires(LocalDateTime.now().plusMinutes(10));

        User savedUser = userRepository.save(newUser);

        String emailBody = "Chào mừng bạn đến với HLPTT!\n"
                + "Mã xác thực của bạn là: " + otp + "\n"
                + "Mã này sẽ hết hạn trong 10 phút.";

        emailService.sendEmail(savedUser.getEmail(), "Xác thực tài khoản HLPTT", emailBody);
        return savedUser;
    }

    public boolean verifyOtp(VerifyOtpRequestDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email này"));

        if (Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadRequestException("Tài khoản này đã được kích hoạt từ trước.");
        }

        if (user.getCodeExpires() == null || user.getCodeExpires().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
        }

        if (!user.getVerificationCode().equals(dto.getOtp())) {
            throw new BadRequestException("Mã OTP không chính xác.");
        }

        user.setIsActive(true);
        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setCodeExpires(null);

        userRepository.save(user);
        return true;
    }

    // ========== ĐĂNG NHẬP ==========

    public LoginResponseDto login(LoginRequestDto dto) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác.");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Lỗi không tìm thấy user sau khi xác thực"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadRequestException("Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.");
        }

        String token = jwtService.generateToken(user);
        return new LoginResponseDto(token, user.getEmail(), user.getFullName());
    }

    // ========== ĐỔI MẬT KHẨU (KHI ĐÃ ĐĂNG NHẬP) ==========

    public boolean changePassword(ChangePasswordRequestDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));

        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu cũ không chính xác.");
        }

        user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
        return true;
    }

    private String generateOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }

    // ========== QUÊN MẬT KHẨU / RESET PASSWORD ==========

    public void forgotPassword(ForgotPasswordRequestDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email này"));

        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetExpires(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        String resetLink = "http://localhost:5500/Frontend/QuenMatKhau/resetPassword.html?token=" + resetToken;

        String subject = "Yêu cầu đặt lại mật khẩu - HLPTT";
        String body = "Xin chào " + user.getFullName() + ",\n\n"
                + "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản HLPTT của bạn.\n"
                + "Vui lòng nhấp vào đường link sau để đặt lại mật khẩu:\n"
                + resetLink + "\n\n"
                + "Lưu ý: Link này chỉ có hiệu lực trong 1 giờ.\n\n"
                + "Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.\n\n"
                + "Trân trọng,\nĐội ngũ HLPTT";

        emailService.sendEmail(user.getEmail(), subject, body);
    }

    public void resetPassword(ResetPasswordRequestDto dto) {
        User user = userRepository.findByPasswordResetToken(dto.getToken())
                .orElseThrow(() -> new BadRequestException("Token không hợp lệ hoặc không tồn tại."));

        if (user.getPasswordResetExpires() == null || user.getPasswordResetExpires().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Token đã hết hạn.");
        }

        user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpires(null);

        userRepository.save(user);
    }

    // ========== PHẦN PHỤC VỤ PROFILE & AVATAR ==========

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user"));
    }

    public User updateProfile(UpdateProfileRequestDto dto) {
        User user = getCurrentUser();

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            user.setFullName(dto.getFullName().trim());
        }
        if (dto.getPhone() != null && !dto.getPhone().isBlank()) {
            user.setPhone(dto.getPhone().trim());
        }

        return userRepository.save(user);
    }

    public User updateAvatar(MultipartFile avatarFile) {
        if (avatarFile == null || avatarFile.isEmpty()) {
            throw new BadRequestException("File ảnh không được để trống");
        }

        User user = getCurrentUser();
        String avatarUrl = cloudinaryService.uploadFile(avatarFile);
        user.setAvatar(avatarUrl);

        return userRepository.save(user);
    }
}
