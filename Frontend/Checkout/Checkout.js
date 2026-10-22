/**
 * Checkout.js - Xử lý thanh toán
 * Updated: Gửi items từ localStorage lên Server (Fix lỗi giỏ hàng trống)
 */

// 1. CẤU HÌNH API (Port 8081)
const API_BASE_URL = "http://localhost:8081/api";
let finalAmountValue = 0;

// 2. HÀM LẤY TOKEN (ĐỒNG BỘ VỚI GIOHANG.JS)
function getToken() {
    return localStorage.getItem("hlpttToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt");
}

// 3. KHỞI TẠO TRANG
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra đăng nhập ngay khi vào trang
    const token = getToken();
    if (!token) {
        alert("Vui lòng đăng nhập lại để tiếp tục.");
        window.location.href = "../LogReg/LogRegUI.html";
        return;
    }
    updateCartBadge(); // Cập nhật số lượng giỏ hàng
    loadOrderInfo();
});

// Hàm cập nhật số lượng giỏ hàng trên badge
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
    const badge = document.getElementById("cartBadge");
    if (badge) {
        badge.textContent = totalQty;
    }
}

function loadOrderInfo() {
    const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const discount = parseFloat(localStorage.getItem("discountAmount")) || 0;

    if (cart.length === 0) {
        alert("Giỏ hàng trống!");
        window.location.href = "../SanPham/sanpham.html";
        return;
    }

    const container = document.getElementById("orderItemsSummary");
    let html = `
        <div class="order-list-container">
        <table class="order-table">
            <thead>
                <tr>
                    <th>Sản phẩm</th>
                    <th style="text-align:center">SL</th>
                    <th style="text-align:right">Đơn giá</th>
                    <th style="text-align:right">Thành tiền</th>
                </tr>
            </thead>
            <tbody>
    `;

    let subtotal = 0;

    cart.forEach(item => {
        const totalItem = item.price * item.qty;
        subtotal += totalItem;
        const imgUrl = item.img || 'https://via.placeholder.com/60';

        html += `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <img src="${imgUrl}" alt="${item.name}" style="width:60px; height:60px; object-fit:cover; border-radius:8px; border:1px solid #e5e7eb;">
                        <span style="font-weight:500; color:#374151;">${item.name}</span>
                    </div>
                </td>
                <td style="text-align:center; font-weight:600; color:#16a34a;">x${item.qty}</td>
                <td style="text-align:right; color:#6b7280;">${new Intl.NumberFormat('vi-VN').format(item.price)}đ</td>
                <td style="text-align:right; font-weight:700; color:#1f2937;">${new Intl.NumberFormat('vi-VN').format(totalItem)}đ</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        </div>
    `;
    container.innerHTML = html;

    document.getElementById("tempTotal").innerText = new Intl.NumberFormat('vi-VN').format(subtotal) + 'đ';
    document.getElementById("discountAmount").innerText = '-' + new Intl.NumberFormat('vi-VN').format(discount) + 'đ';

    finalAmountValue = Math.max(0, subtotal - discount);
    document.getElementById("finalTotal").innerText = new Intl.NumberFormat('vi-VN').format(finalAmountValue) + 'đ';
}

function selectPayment(method) {
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    const radio = document.querySelector(`input[value="${method}"]`);
    if (radio) {
        radio.checked = true;
        radio.parentElement.classList.add('selected');
    }
}

// 4. XỬ LÝ NÚT ĐẶT HÀNG
async function processCheckout() {
    // Kiểm tra lại token trước khi gửi request
    const token = getToken();
    if (!token) {
        alert("Phiên đăng nhập hết hạn!");
        window.location.href = "../LogReg/LogRegUI.html";
        return;
    }

    // Validate Form
    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const note = document.getElementById("note").value.trim();

    const paymentRadio = document.querySelector('input[name="payment"]:checked');
    const paymentMethod = paymentRadio ? paymentRadio.value : 'cod';

    if (!fullName || !phone || !email || !address) {
        alert("Vui lòng điền đầy đủ thông tin giao hàng!");
        return;
    }

    // === CHUẨN BỊ DỮ LIỆU GỬI LÊN (QUAN TRỌNG) ===
    // Lấy giỏ hàng từ localStorage
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    if (cartItems.length === 0) {
        alert("Giỏ hàng trống!");
        return;
    }

    // Chuyển đổi cartItems (localStorage) -> items (Backend DTO)
    // item.id chính là productId
    // Lọc ra các item có ID hợp lệ (không phải timestamp)
    const validCartItems = cartItems.filter(item => {
        const id = parseInt(item.id);
        // ID hợp lệ phải nhỏ hơn 2147483647 (max int)
        if (id > 2147483647 || id < 1) {
            console.warn('⚠️ Item có ID không hợp lệ:', item);
            return false;
        }
        return true;
    });

    if (validCartItems.length === 0) {
        alert('❌ Giỏ hàng chứa dữ liệu không hợp lệ. Vui lòng xóa giỏ hàng và thêm sản phẩm lại!');
        submitBtn.disabled = false;
        submitBtn.innerText = "ĐẶT HÀNG NGAY";
        return;
    }

    if (validCartItems.length < cartItems.length) {
        alert(`⚠️ Đã loại bỏ ${cartItems.length - validCartItems.length} sản phẩm không hợp lệ khỏi giỏ hàng.`);
    }

    const orderItems = validCartItems.map(item => ({
        productId: item.id,
        quantity: item.qty
    }));

    // Lấy mã giảm giá nếu có
    const couponCode = localStorage.getItem("appliedCoupon") || "";

    const payload = {
        shippingFullName: fullName,
        shippingPhone: phone,
        shippingEmail: email,
        shippingAddress: address,
        note: note,
        paymentMethod: paymentMethod,
        couponCode: couponCode,
        items: orderItems // <--- Gửi danh sách sản phẩm lên đây
    };

    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.innerText = "Đang xử lý...";

    try {
        // Gọi API tạo đơn hàng
        const res = await fetch(`${API_BASE_URL}/orders/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();

            // === XỬ LÝ KẾT QUẢ ===
            if (paymentMethod === 'vnpay') {
                // Nếu là VNPay -> Gọi tiếp API thanh toán với số tiền thực tế từ đơn hàng vừa tạo
                // Lưu ý: data.totalAmount là tổng tiền cuối cùng từ Server trả về
                try {
                    const vnpRes = await fetch(`${API_BASE_URL}/payment/create_payment?amount=${data.totalAmount}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const vnpData = await vnpRes.json();

                    if (vnpData.status === 'OK' && vnpData.url) {
                        console.log("Redirecting to VNPay:", vnpData.url);
                        window.location.href = vnpData.url;
                    } else {
                        alert("Lỗi tạo link VNPay. Vui lòng thử lại.");
                        submitBtn.disabled = false;
                    }
                } catch (vnpErr) {
                    console.error(vnpErr);
                    alert("Lỗi kết nối cổng thanh toán.");
                    submitBtn.disabled = false;
                }

            } else {
                // COD -> Xong luôn
                alert("🎉 Đặt hàng thành công! Mã đơn: " + data.orderCode);

                // Dọn dẹp localStorage
                localStorage.removeItem("cartItems");
                localStorage.removeItem("appliedCoupon");
                localStorage.removeItem("discountAmount");
                localStorage.removeItem("appliedCouponPercent");

                // Về trang chủ
                window.location.href = "../TrangChu/trangchu.html";
            }
        } else {
            // Xử lý lỗi từ Server (401, 403, 500...)
            if (res.status === 403 || res.status === 401) {
                alert("Lỗi xác thực: Vui lòng đăng nhập lại.");
                window.location.href = "../LogReg/LogRegUI.html";
            } else {
                const text = await res.text();
                console.error("Server Error:", text);
                // Cố gắng parse JSON lỗi nếu có
                try {
                    const errObj = JSON.parse(text);
                    alert("Lỗi đặt hàng: " + (errObj.message || text));
                } catch (e) {
                    alert("Lỗi đặt hàng: " + text);
                }
            }
            submitBtn.disabled = false;
            submitBtn.innerText = "ĐẶT HÀNG NGAY";
        }
    } catch (e) {
        console.error(e);
        alert("Không thể kết nối Backend (Port 8081). Hãy kiểm tra server.");
        submitBtn.disabled = false;
        submitBtn.innerText = "ĐẶT HÀNG NGAY";
    }
}

// Hàm xóa giỏ hàng (global để gọi từ HTML)
function clearCart() {
    if (!confirm('⚠️ Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
        return;
    }
    localStorage.removeItem('cartItems');
    localStorage.removeItem('appliedCoupon');
    localStorage.removeItem('discountAmount');
    localStorage.removeItem('appliedCouponPercent');
    alert('✅ Đã xóa giỏ hàng!');
    window.location.href = '../TrangChu/trangchu.html';
}
