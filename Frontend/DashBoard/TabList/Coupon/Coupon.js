// Biến toàn cục
if (typeof window.couponList === 'undefined') {
    window.couponList = [];
}

const API_COUPON = `${API_BASE}/coupons`;

// === 1. KHỞI TẠO ===
window.initCouponPage = function() {
    console.log("Coupon Module Loaded");
    loadCouponData();
}

// === 2. TẢI DỮ LIỆU ===
async function loadCouponData() {
    const token = localStorage.getItem("hlpttAdminToken");
    const tbody = document.getElementById("couponTableBody");
    if(tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center">⏳ Đang tải...</td></tr>`;

    try {
        const res = await fetch(API_COUPON, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Lỗi tải dữ liệu");
        
        const data = await res.json();
        // Backend trả về List<Coupon>, không phải Page
        window.couponList = data;
        
        renderCouponTable(data);

    } catch (e) {
        console.error(e);
        if(tbody) tbody.innerHTML = `<tr><td colspan="8" style="color:red; text-align:center">Lỗi kết nối Server!</td></tr>`;
    }
}

// === 3. RENDER BẢNG ===
function renderCouponTable(list) {
    const tbody = document.getElementById("couponTableBody");
    if(!tbody) return;
    tbody.innerHTML = "";

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center">Chưa có mã giảm giá nào.</td></tr>`;
        return;
    }

    list.forEach(c => {
        // Format giá trị giảm
        let discountDisplay = "";
        if (c.discountType === 'percentage') {
            discountDisplay = `<span class="discount-highlight">-${c.discountValue}%</span>`;
            if(c.maxDiscountAmount) {
                discountDisplay += `<br><span class="text-grey">Tối đa: ${new Intl.NumberFormat('vi-VN').format(c.maxDiscountAmount)}đ</span>`;
            }
        } else {
            discountDisplay = `<span class="discount-highlight">-${new Intl.NumberFormat('vi-VN').format(c.discountValue)}đ</span>`;
        }

        // Format thời gian
        const start = c.startDate ? new Date(c.startDate).toLocaleDateString('vi-VN') : '...';
        const end = c.endDate ? new Date(c.endDate).toLocaleDateString('vi-VN') : 'Vô thời hạn';
        
        // Xác định trạng thái
        const now = new Date();
        let statusHtml = "";
        if (c.isActive === false) {
            statusHtml = `<span class="badge-inactive">Đã khóa</span>`;
        } else if (c.endDate && new Date(c.endDate) < now) {
            statusHtml = `<span class="badge-expired">Hết hạn</span>`;
        } else if (c.usageLimit && c.usedCount >= c.usageLimit) {
            statusHtml = `<span class="badge-expired">Hết lượt</span>`;
        } else {
            statusHtml = `<span class="badge-active">Đang chạy</span>`;
        }

        const row = `
            <tr>
                <td>#${c.couponId}</td>
                <td><span class="code-text">${c.couponCode}</span></td>
                <td>${discountDisplay}</td>
                <td>${new Intl.NumberFormat('vi-VN').format(c.minOrderValue || 0)}đ</td>
                <td>
                    <b>${c.usedCount}</b> / ${c.usageLimit || '∞'}
                </td>
                <td>
                    <span class="text-grey">Từ: ${start}</span><br>
                    <span class="text-grey">Đến: ${end}</span>
                </td>
                <td>${statusHtml}</td>
                <td>
                    <button class="action-btn" style="background:#dbeafe; color:#1e40af" onclick="window.openEditCoupon(${c.couponId})" title="Sửa">✏️</button>
                    <button class="action-btn" style="background:#fee2e2; color:#991b1b" onclick="window.deleteCoupon(${c.couponId})" title="Xóa">🗑️</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// === 4. XỬ LÝ MODAL ===
window.openAddCouponModal = function() {
    document.getElementById("couponForm").reset();
    document.getElementById("cpId").value = "";
    document.getElementById("cpCode").readOnly = false; // Thêm mới được nhập Code
    
    document.getElementById("cpValue").value = "";
    document.getElementById("cpMinOrder").value = 0;
    
    // Mặc định ẩn Max Discount nếu type là fixed (gọi hàm toggle)
    window.toggleMaxDiscount();
    
    document.getElementById("couponModalTitle").innerText = "Tạo mã giảm giá mới";
    document.getElementById("couponModal").classList.remove("hidden");
}

window.openEditCoupon = function(id) {
    const coupon = window.couponList.find(c => c.couponId === id);
    if (!coupon) return;

    // Điền dữ liệu
    document.getElementById("cpId").value = coupon.couponId;
    document.getElementById("cpCode").value = coupon.couponCode;
    document.getElementById("cpCode").readOnly = true; // Không sửa code
    document.getElementById("cpType").value = coupon.discountType;
    document.getElementById("cpValue").value = coupon.discountValue;
    document.getElementById("cpMinOrder").value = coupon.minOrderValue;
    document.getElementById("cpMaxDiscount").value = coupon.maxDiscountAmount || "";
    document.getElementById("cpLimit").value = coupon.usageLimit || "";
    document.getElementById("cpDesc").value = coupon.description || "";
    document.getElementById("cpActive").checked = coupon.isActive;

    // Format date cho input (YYYY-MM-DDTHH:mm)
    if(coupon.startDate) document.getElementById("cpStart").value = coupon.startDate.substring(0, 16);
    else document.getElementById("cpStart").value = "";
    
    if(coupon.endDate) document.getElementById("cpEnd").value = coupon.endDate.substring(0, 16);
    else document.getElementById("cpEnd").value = "";

    // Cập nhật hiển thị ô Max Discount
    window.toggleMaxDiscount();

    document.getElementById("couponModalTitle").innerText = `Cập nhật mã: ${coupon.couponCode}`;
    document.getElementById("couponModal").classList.remove("hidden");
}

window.closeCouponModal = function() {
    document.getElementById("couponModal").classList.add("hidden");
}

// Ẩn/Hiện ô "Giảm tối đa" tùy loại giảm giá
window.toggleMaxDiscount = function() {
    const type = document.getElementById("cpType").value;
    const maxDiv = document.getElementById("maxDiscountGroup");
    const input = document.getElementById("cpMaxDiscount");
    
    if (type === 'percentage') {
        maxDiv.style.visibility = 'visible'; // Hoặc display block
        input.disabled = false;
    } else {
        maxDiv.style.visibility = 'hidden';
        input.value = "";
        input.disabled = true;
    }
}

// === 5. LƯU DỮ LIỆU ===
window.saveCoupon = async function() {
    const token = localStorage.getItem("hlpttAdminToken");
    const id = document.getElementById("cpId").value;
    
    // Validate cơ bản
    const code = document.getElementById("cpCode").value.trim();
    const value = document.getElementById("cpValue").value;
    
    if (!code || !value) {
        alert("Vui lòng nhập Mã Code và Giá trị giảm!");
        return;
    }

    const payload = {
        couponCode: code.toUpperCase(),
        discountType: document.getElementById("cpType").value,
        discountValue: parseFloat(value),
        minOrderValue: parseFloat(document.getElementById("cpMinOrder").value) || 0,
        maxDiscountAmount: document.getElementById("cpMaxDiscount").value ? parseFloat(document.getElementById("cpMaxDiscount").value) : null,
        usageLimit: document.getElementById("cpLimit").value ? parseInt(document.getElementById("cpLimit").value) : null,
        startDate: document.getElementById("cpStart").value || null,
        endDate: document.getElementById("cpEnd").value || null,
        description: document.getElementById("cpDesc").value,
        isActive: document.getElementById("cpActive").checked
    };

    const url = id ? `${API_COUPON}/${id}` : API_COUPON;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert(id ? "Cập nhật thành công!" : "Tạo mã thành công!");
            window.closeCouponModal();
            loadCouponData();
        } else {
            // Xử lý lỗi (vd: Trùng mã)
            const err = await res.text(); // Hoặc json() tùy backend trả về
            try {
                const errObj = JSON.parse(err);
                alert("Lỗi: " + (errObj.message || err));
            } catch (e) {
                alert("Lỗi: " + err);
            }
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối hệ thống!");
    }
}

// === 6. XÓA ===
window.deleteCoupon = async function(id) {
    if(!confirm("Bạn có chắc muốn xóa mã giảm giá này?")) return;
    const token = localStorage.getItem("hlpttAdminToken");
    
    try {
        const res = await fetch(`${API_COUPON}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) {
            alert("Đã xóa!");
            loadCouponData();
        } else {
            alert("Xóa thất bại!");
        }
    } catch (e) { console.error(e); }
}

// === 7. TÌM KIẾM (Client Side) ===
window.searchCoupon = function() {
    const key = document.getElementById("couponSearchInput").value.toUpperCase();
    const filtered = window.couponList.filter(c => 
        c.couponCode.includes(key)
    );
    renderCouponTable(filtered);
}