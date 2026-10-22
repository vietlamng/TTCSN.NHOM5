package com.hlptt.service;

import com.hlptt.entity.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public void sendEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Gửi email thất bại: " + e.getMessage());
        }
    }
    
    /**
     * Gửi email thông báo cập nhật trạng thái đơn hàng
     */
    public void sendOrderStatusUpdateEmail(Order order, String newStatus) {
        try {
            String subject = getEmailSubject(newStatus, order.getOrderCode());
            String body = buildEmailBody(order, newStatus);
            
            sendEmail(order.getShippingEmail(), subject, body);
            System.out.println("✅ Đã gửi email thông báo đơn hàng đến: " + order.getShippingEmail());
        } catch (Exception e) {
            // Log lỗi nhưng không throw để không ảnh hưởng đến việc cập nhật đơn
            System.err.println("❌ Không thể gửi email: " + e.getMessage());
        }
    }
    
    private String getEmailSubject(String status, String orderCode) {
        switch (status.toUpperCase()) {
            case "CONFIRMED":
                return "✅ Đơn hàng #" + orderCode + " đã được xác nhận";
            case "PROCESSING":
                return "📦 Đơn hàng #" + orderCode + " đang được xử lý";
            case "SHIPPING":
                return "🚚 Đơn hàng #" + orderCode + " đang được giao";
            case "DELIVERED":
                return "✅ Đơn hàng #" + orderCode + " đã giao thành công";
            case "COMPLETED":
                return "🎉 Đơn hàng #" + orderCode + " đã hoàn tất";
            case "CANCELLED":
                return "❌ Đơn hàng #" + orderCode + " đã bị hủy";
            default:
                return "📧 Cập nhật đơn hàng #" + orderCode;
        }
    }
    
    private String buildEmailBody(Order order, String newStatus) {
        StringBuilder body = new StringBuilder();
        
        body.append("Kính gửi: ").append(order.getShippingFullName()).append("\n\n");
        body.append("Đơn hàng của bạn đã được cập nhật trạng thái mới.\n\n");
        
        body.append("═══════════════════════════════════\n");
        body.append("THÔNG TIN ĐƠN HÀNG\n");
        body.append("═══════════════════════════════════\n");
        body.append("Mã đơn hàng: ").append(order.getOrderCode()).append("\n");
        body.append("Trạng thái: ").append(getStatusMessage(newStatus)).append("\n");
        body.append("Ngày đặt: ").append(order.getCreatedAt().format(DATE_FORMATTER)).append("\n");
        body.append("Tổng tiền: ").append(String.format("%,.0f₫", order.getTotalAmount())).append("\n");
        
        if (order.getAdminNote() != null && !order.getAdminNote().isEmpty()) {
            body.append("\nGhi chú: ").append(order.getAdminNote()).append("\n");
        }
        
        body.append("═══════════════════════════════════\n\n");
        
        // Danh sách sản phẩm
        body.append("CHI TIẾT SẢN PHẨM:\n");
        body.append("───────────────────────────────────\n");
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            int itemNum = 1;
            for (var item : order.getOrderItems()) {
                body.append(String.format("%d. %s\n", itemNum++, item.getProductName()));
                body.append(String.format("   Số lượng: %d\n", item.getQuantity()));
                body.append(String.format("   Đơn giá: %,.0f₫\n", item.getUnitPrice()));
                body.append(String.format("   Thành tiền: %,.0f₫\n", item.getTotalPrice()));
                body.append("\n");
            }
        } else {
            body.append("Không có sản phẩm\n\n");
        }
        body.append("═══════════════════════════════════\n\n");
        
        body.append(getStatusDescription(newStatus)).append("\n\n");
        
        body.append("Trân trọng,\n");
        body.append("HLPTT Team\n");
        body.append("Email: support@hlptt.com | Hotline: 1900-xxxx\n");
        
        return body.toString();
    }
    
    private String getStatusMessage(String status) {
        switch (status.toUpperCase()) {
            case "CONFIRMED": return "Đã xác nhận ✓";
            case "PROCESSING": return "Đang xử lý...";
            case "SHIPPING": return "Đang giao hàng 🚚";
            case "DELIVERED": return "Đã giao hàng ✓";
            case "COMPLETED": return "Hoàn tất ✓";
            case "CANCELLED": return "Đã hủy ✗";
            default: return status;
        }
    }
    
    private String getStatusDescription(String status) {
        switch (status.toUpperCase()) {
            case "CONFIRMED":
                return "Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.";
            case "PROCESSING":
                return "Chúng tôi đang xử lý và đóng gói đơn hàng của bạn cẩn thận.";
            case "SHIPPING":
                return "Đơn hàng đã được giao cho đơn vị vận chuyển. Bạn sẽ nhận được hàng trong 2-3 ngày làm việc.";
            case "DELIVERED":
                return "Đơn hàng đã được giao thành công. Cảm ơn bạn đã mua hàng tại HLPTT!";
            case "COMPLETED":
                return "Đơn hàng đã hoàn tất. Rất mong được phục vụ bạn lần sau!";
            case "CANCELLED":
                return "Đơn hàng đã được hủy. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.";
            default:
                return "Trạng thái đơn hàng của bạn đã được cập nhật.";
        }
    }
}