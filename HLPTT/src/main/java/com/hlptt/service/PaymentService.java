package com.hlptt.service;

import com.hlptt.config.VnPayConfig;
import com.hlptt.dto.PaymentResDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired; // Đừng quên import này
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class PaymentService {

    // 1. INJECT CONFIG VÀO ĐỂ DÙNG (Thay vì gọi static)
    @Autowired
    private VnPayConfig vnPayConfig;

    public PaymentResDTO createVnPayPayment(HttpServletRequest req, long amount) throws UnsupportedEncodingException {
        long vnp_Amount = amount * 100;

        // 2. CÁC HÀM TIỆN ÍCH (Random, IP) THÌ VẪN GỌI STATIC ĐƯỢC
        String vnp_TxnRef = VnPayConfig.getRandomNumber(8);
        String vnp_IpAddr = VnPayConfig.getIpAddress(req);

        // 3. CÁC BIẾN CẤU HÌNH PHẢI GỌI QUA BIẾN vnPayConfig ĐÃ INJECT
        String vnp_TmnCode = vnPayConfig.getVnp_TmnCode(); 
        
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(vnp_Amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_BankCode", "NCB");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        
        // Sửa lỗi: Gọi qua getter
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnp_ReturnUrl()); 
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Build URL
        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                //Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        
        String queryUrl = query.toString();
        
        // Sửa lỗi: Gọi qua getter để lấy HashSecret
        String vnp_SecureHash = VnPayConfig.hmacSHA512(vnPayConfig.getVnp_HashSecret(), hashData.toString());
        
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        
        // Sửa lỗi: Gọi qua getter để lấy PayUrl
        String paymentUrl = vnPayConfig.getVnp_PayUrl() + "?" + queryUrl;
        
        PaymentResDTO paymentResDTO = new PaymentResDTO();
        paymentResDTO.setStatus("OK");
        paymentResDTO.setMessage("Successfully");
        paymentResDTO.setURL(paymentUrl);
        
        return paymentResDTO;
    }
}