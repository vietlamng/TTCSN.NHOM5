INSERT INTO order_statuses (status_name, description, color_code, display_order)
SELECT 'pending', 'Đơn hàng vừa được tạo, chờ xác nhận', '#FFA500', 1
WHERE NOT EXISTS (
    SELECT 1 FROM order_statuses WHERE status_name = 'pending'
);

INSERT INTO order_statuses (status_name, description, color_code, display_order)
SELECT 'confirmed', 'Đơn hàng đã được xác nhận', '#4CAF50', 2
WHERE NOT EXISTS (
    SELECT 1 FROM order_statuses WHERE status_name = 'confirmed'
);

INSERT INTO order_statuses (status_name, description, color_code, display_order)
SELECT 'shipping', 'Đơn hàng đang được vận chuyển', '#2196F3', 3
WHERE NOT EXISTS (
    SELECT 1 FROM order_statuses WHERE status_name = 'shipping'
);

INSERT INTO order_statuses (status_name, description, color_code, display_order)
SELECT 'completed', 'Đơn hàng đã giao thành công', '#2E7D32', 4
WHERE NOT EXISTS (
    SELECT 1 FROM order_statuses WHERE status_name = 'completed'
);

INSERT INTO order_statuses (status_name, description, color_code, display_order)
SELECT 'cancelled', 'Đơn hàng đã bị hủy', '#F44336', 5
WHERE NOT EXISTS (
    SELECT 1 FROM order_statuses WHERE status_name = 'cancelled'
);

