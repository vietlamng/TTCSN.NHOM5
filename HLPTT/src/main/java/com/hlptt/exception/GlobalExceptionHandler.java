package com.hlptt.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Xử lý lỗi BadRequestException (Lỗi dữ liệu đầu vào, giỏ hàng trống...) ->
    // Trả về 400
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<?> handleBadRequest(BadRequestException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Bad Request");
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // 2. Xử lý lỗi ResourceNotFoundException (Không tìm thấy user, cart...) -> Trả
    // về 404
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Not Found");
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // 3. Xử lý lỗi UnauthorizedException (Chưa đăng nhập/sai quyền) -> Trả về 401
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<?> handleUnauthorized(UnauthorizedException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Unauthorized");
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    // 4. Xử lý tất cả các lỗi còn lại (NullPointer, SQL error...) -> Trả về 500
    // nhưng có chi tiết
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGlobalException(Exception ex) {
        ex.printStackTrace(); // In lỗi ra Terminal để bạn debug (quan trọng)

        Map<String, String> response = new HashMap<>();
        response.put("error", "Internal Server Error");

        // Lấy thông báo lỗi gốc để hiển thị
        String message = ex.getMessage();
        if (message == null) {
            // Nếu lỗi NullPointerException thì message thường là null, ta lấy tên class lỗi
            message = "Lỗi hệ thống: " + ex.getClass().getSimpleName();
        }
        response.put("message", message);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}