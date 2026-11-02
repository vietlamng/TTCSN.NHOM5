// 1. KHAI BÁO BIẾN AN TOÀN
if (typeof window.API_ORDER === 'undefined') {
    window.API_ORDER = `${API_BASE}/orders`;
}
if (typeof window.orderList === 'undefined') {
    window.orderList = [];
}
if (typeof window.currentOrderStatus === 'undefined') {
    window.currentOrderStatus = 'ALL';
}

// === 1. INIT ===
window.initOrderPage = function () {
    console.log("Order Module Loaded");
    loadOrderData();
}

// === 2. LOAD DATA ===
async function loadOrderData(status = null) {
    const token = localStorage.getItem("hlpttAdminToken");
    const tbody = document.getElementById("orderTableBody");

    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#666;">Đang tải dữ liệu...</td></tr>`;

    try {
        let url = `${window.API_ORDER}?sort=orderId,desc`;
        if (status && status !== 'ALL') {
            url += `&status=${status}`;
        }

        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error(`Lỗi tải dữ liệu (${res.status})`);

        const data = await res.json();
        window.orderList = data.content ? data.content : (Array.isArray(data) ? data : []);
        renderOrderTable(window.orderList);

    } catch (e) {
        console.error(e);
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center">Lỗi kết nối: ${e.message}</td></tr>`;
    }
}

// === 2b. FILTER BY STATUS ===
window.filterOrdersByStatus = function (status) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.status === status) {
            btn.classList.add('active');
        }
    });
    window.currentOrderStatus = status;
    loadOrderData(status);
}

// === 3. RENDER TABLE ===
function renderOrderTable(list) {
    const tbody = document.getElementById("orderTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">Chưa có đơn hàng nào.</td></tr>`;
        return;
    }

    list.forEach(o => {
        let statusHtml = '';
        let allowShip = false;
        let allowCancel = false;

        const statusName = (o.status && o.status.statusName) ? o.status.statusName.toUpperCase() : 'CONFIRMED';

        if (statusName === 'COMPLETED') {
            statusHtml = `<span class="status-badge status-paid">Hoàn thành</span>`;
        } else if (statusName === 'CANCELLED') {
            statusHtml = `<span class="status-badge status-failed">Đã hủy</span>`;
        } else if (statusName === 'SHIPPING' || statusName === 'SHIPPED') {
            statusHtml = `<span class="status-badge status-pending" style="background: #dbeafe; color: #1d4ed8;">Đang giao</span>`;
        } else {
            // CONFIRMED hoặc PENDING
            statusHtml = `<span class="status-badge status-confirmed" style="background: #e8f5e9; color: #2e7d32;">Đã xác nhận</span>`;
            allowShip = true;
            allowCancel = true;
        }

        const date = o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : '--';
        const total = new Intl.NumberFormat('vi-VN').format(o.totalAmount);

        const row = `
            <tr>
                <td><span class="code-text">${o.orderCode || '#' + o.orderId}</span></td>
                <td class="customer-info">
                    <b>${o.shippingFullName}</b><br>
                    <small style="color:#666">${o.shippingPhone}</small>
                </td>
                <td class="price-text">${total}đ</td>
                <td><span style="font-weight:600; color:#555;">${o.paymentMethod || 'COD'}</span></td>
                <td>${statusHtml}</td>
                <td><small>${date}</small></td>
                <td>
                    <button class="action-btn btn-view" onclick="window.viewOrderDetail(${o.orderId})" title="Xem chi tiết">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    ${allowShip ? `
                        <button class="action-btn btn-success" onclick="window.updateOrderStatus(${o.orderId}, 'SHIPPING')" title="Giao hàng">
                            <i class="fa-solid fa-truck"></i>
                        </button>
                    ` : ''}
                    ${allowCancel ? `
                        <button class="action-btn btn-fail" onclick="window.updateOrderStatus(${o.orderId}, 'CANCELLED')" title="Hủy đơn">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// === 4. XEM CHI TIẾT ===
window.viewOrderDetail = async function (id) {
    const token = localStorage.getItem("hlpttAdminToken");

    try {
        const res = await fetch(`${window.API_ORDER}/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Không tải được chi tiết đơn");

        const order = await res.json();
        renderModalContent(order);
        document.getElementById("orderModal").classList.remove("hidden");

    } catch (e) {
        alert("Lỗi: " + e.message);
    }
}

function renderModalContent(order) {
    const content = document.getElementById("orderDetailContent");
    const actions = document.getElementById("modalActions");

    if (content) {
        document.getElementById("orderModalTitle").innerText = `Đơn hàng ${order.orderCode || '#' + order.orderId}`;

        let html = `
            <div class="detail-section">
                <div class="detail-title">Thông tin khách hàng</div>
                <div class="info-grid">
                    <div class="info-item"><label>Người nhận</label><span>${order.shippingFullName}</span></div>
                    <div class="info-item"><label>Số điện thoại</label><span>${order.shippingPhone}</span></div>
                    <div class="info-item"><label>Email</label><span>${order.shippingEmail || '--'}</span></div>
                    <div class="info-item"><label>Ngày đặt</label><span>${new Date(order.createdAt).toLocaleString('vi-VN')}</span></div>
                </div>
                <div class="info-item" style="margin-top:10px"><label>Địa chỉ</label><span>${order.shippingAddress}</span></div>
                <div class="info-item" style="margin-top:5px"><label>Ghi chú</label><span>${order.note || 'Không có'}</span></div>
                ${order.adminNote ? `<div class="info-item" style="margin-top:5px; color:red"><label>Ghi chú Admin</label><span>${order.adminNote}</span></div>` : ''}
            </div>

            <div class="detail-section">
                <div class="detail-title">Danh sách sản phẩm</div>
                <table class="product-list-mini">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th style="text-align:center">SL</th>
                            <th style="text-align:right">Đơn giá</th>
                            <th style="text-align:right">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>`;

        if (order.orderItems && order.orderItems.length > 0) {
            order.orderItems.forEach(item => {
                let img = "https://via.placeholder.com/40";
                if (item.product && item.product.productImages && item.product.productImages.length > 0) {
                    img = item.product.productImages[0].imageUrl;
                }
                html += `
                    <tr>
                        <td><img src="${img}" class="mini-img"> ${item.productName}</td>
                        <td style="text-align:center">x${item.quantity}</td>
                        <td style="text-align:right">${new Intl.NumberFormat('vi-VN').format(item.unitPrice)}</td>
                        <td style="text-align:right; font-weight:bold;">${new Intl.NumberFormat('vi-VN').format(item.totalPrice)}</td>
                    </tr>`;
            });
        } else {
            html += `<tr><td colspan="4" style="text-align:center">Không có thông tin sản phẩm</td></tr>`;
        }

        html += `</tbody></table></div>`;

        html += `
            <div style="text-align:right; margin-top:15px; font-size:16px;">
                Tạm tính: ${new Intl.NumberFormat('vi-VN').format(order.subtotal || 0)}đ <br>
                Phí ship: ${new Intl.NumberFormat('vi-VN').format(order.shippingFee || 0)}đ <br>
                Giảm giá: -${new Intl.NumberFormat('vi-VN').format(order.discountAmount || 0)}đ <br>
                <div style="font-size:20px; font-weight:800; color:#d0021b; margin-top:5px;">
                    TỔNG CỘNG: ${new Intl.NumberFormat('vi-VN').format(order.totalAmount)}đ
                </div>
            </div>`;

        content.innerHTML = html;
    }

    if (actions) {
        const statusName = (order.status && order.status.statusName) ? order.status.statusName.toUpperCase() : 'CONFIRMED';
        if (statusName === 'CONFIRMED' || statusName === 'PENDING' || statusName === 'NEW') {
            actions.innerHTML = `
                <button class="btn-success" onclick="window.updateOrderStatus(${order.orderId}, 'SHIPPING'); window.closeOrderModal();">Giao hàng</button>
                <button class="btn-fail" onclick="window.updateOrderStatus(${order.orderId}, 'CANCELLED'); window.closeOrderModal();">Hủy đơn</button>
            `;
        } else {
            actions.innerHTML = '';
        }
    }
}

window.closeOrderModal = function () {
    document.getElementById("orderModal").classList.add("hidden");
}

// === 5. CẬP NHẬT TRẠNG THÁI ===
window.updateOrderStatus = async function (id, status) {
    const actionName = status === 'SHIPPING' ? "GIAO HÀNG" : "HỦY";
    const note = prompt(`Nhập ghi chú cho việc ${actionName} đơn hàng (hoặc để trống):`);
    if (note === null) return;

    const token = localStorage.getItem("hlpttAdminToken");
    try {
        const res = await fetch(`${window.API_ORDER}/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                status: status,
                note: note || `Admin cập nhật trạng thái: ${actionName}`
            })
        });

        if (res.ok) {
            alert("Cập nhật thành công!");
            loadOrderData(window.currentOrderStatus);
        } else {
            const errorText = await res.text();
            alert("Lỗi cập nhật: " + errorText);
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi hệ thống!");
    }
}

// === 6. SEARCH ===
window.searchOrder = function () {
    const key = document.getElementById("orderSearchInput").value.toLowerCase();
    const filtered = window.orderList.filter(o =>
        (o.orderCode && o.orderCode.toLowerCase().includes(key)) ||
        (o.shippingFullName && o.shippingFullName.toLowerCase().includes(key))
    );
    renderOrderTable(filtered);
}