package com.hlptt.controller;

import com.hlptt.dto.PaymentResDTO;
import com.hlptt.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/create_payment")
    public ResponseEntity<?> createPayment(
            HttpServletRequest req,
            @RequestParam(name = "amount") long amount
    ) throws UnsupportedEncodingException {
        
        PaymentResDTO paymentResDTO = paymentService.createVnPayPayment(req, amount);
        
        return ResponseEntity.status(HttpStatus.OK).body(paymentResDTO);
    }

    @GetMapping("/vnpay_return")
    public void transactionReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
        String vnp_TxnRef = request.getParameter("vnp_TxnRef");
        
        String frontendUrl = "http://127.0.0.1:5500/Frontend/Payment/PaymentResult.html";

        if ("00".equals(vnp_ResponseCode)) {
            response.sendRedirect(frontendUrl + "?status=success&orderCode=" + vnp_TxnRef);
        } else {
            response.sendRedirect(frontendUrl + "?status=failed&orderCode=" + vnp_TxnRef);
        }
    }
}