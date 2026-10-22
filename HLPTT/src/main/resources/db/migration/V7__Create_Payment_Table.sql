CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL, -- Sửa thành INT để khớp với bảng orders
    user_id INT,           -- Sửa thành INT để khớp với bảng users
    payment_method VARCHAR(50) DEFAULT 'VNPAY',
    transaction_ref VARCHAR(100),
    transaction_no VARCHAR(100),
    amount DECIMAL(15, 2),
    status VARCHAR(20),
    payment_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(order_id), -- Sửa tham chiếu thành order_id
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(user_id)      -- Sửa tham chiếu thành user_id
);