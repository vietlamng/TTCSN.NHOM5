// Frontend/DonHang/donhang.js
// Trang "Đơn hàng của tôi" - Lấy dữ liệu từ HLPTT backend

// 1. CẤU HÌNH API
const API_BASE_URL =
  (typeof window !== "undefined" && typeof window.API_BASE === "string")
    ? window.API_BASE
    : "http://localhost:8081/api";

// 2. HÀM LẤY TOKEN
function getToken() {
  return (
    localStorage.getItem("hlpttToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt")
  );
}

// 3. KHỞI TẠO TRANG
let currentStatus = "ALL"; // Track current filter status

document.addEventListener("DOMContentLoaded", () => {
  checkAuthForOrdersPage();
  loadOrders();
  initializeStatusTabs();
});

// Initialize status filter tabs
function initializeStatusTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Update active tab
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Update current status and reload
      currentStatus = tab.dataset.status;
      loadOrders();
    });
  });
}

// 4. KIỂM TRA ĐĂNG NHẬP
function checkAuthForOrdersPage() {
  const token = getToken();
  if (!token) {
    alert("Vui lòng đăng nhập để xem đơn hàng.");
    window.location.href = "../LogReg/LogRegUI.html";
  }
}

// 5. GỌI API LẤY DANH SÁCH ĐƠN HÀNG
async function loadOrders(page = 0, size = 10) {
  const loadingEl = document.getElementById("ordersLoading");
  const errorEl = document.getElementById("ordersError");
  const emptyEl = document.getElementById("emptyMessage");
  const container = document.getElementById("ordersContainer");

  if (!loadingEl || !errorEl || !emptyEl || !container) {
    console.error("Thiếu phần tử DOM cho trang đơn hàng.");
    return;
  }

  loadingEl.style.display = "block";
  errorEl.style.display = "none";
  emptyEl.style.display = "none";
  container.innerHTML = "";

  const token = getToken();
  if (!token) {
    return checkAuthForOrdersPage();
  }

  try {
    let url = `${API_BASE_URL}/orders/my-orders?page=${page}&size=${size}&sort=createdAt,desc`;

    // Add status filter if not ALL
    if (currentStatus && currentStatus !== "ALL") {
      url += `&status=${currentStatus}`;
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const orders = Array.isArray(data) ? data : data.content || [];

    if (!orders || orders.length === 0) {
      emptyEl.style.display = "block";
      return;
    }

    renderOrders(orders);
  } catch (err) {
    console.error(err);
    errorEl.textContent = "Không thể tải đơn hàng: " + err.message;
    errorEl.style.display = "block";
  } finally {
    loadingEl.style.display = "none";
  }
}

// 6. RENDER DANH SÁCH ĐƠN HÀNG
function renderOrders(orders) {
  const container = document.getElementById("ordersContainer");
  if (!container) return;
  container.innerHTML = "";

  orders.forEach((order) => {
    const card = document.createElement("div");
    card.className = "order-card";

    // Trạng thái lấy từ OrderStatus.statusName hoặc paymentStatus
    const rawStatus =
      (order.status &&
        (order.status.statusName || order.status.status_name)) ||
      order.paymentStatus ||
      "";
    const statusKey = String(rawStatus || "").trim().toUpperCase();
    const statusClass = getStatusClass(statusKey);
    const statusText = rawStatus || "Không rõ";

    const created = formatDateTime(order.createdAt || order.created_at);
    const totalAmount = order.totalAmount || order.total_amount || 0;

    // ===== HEADER - Compact Summary =====
    const header = document.createElement("div");
    header.className = "order-header";
    header.innerHTML = `
      <div class="order-header-main">
        <div class="order-code">
          Mã đơn: ${escapeHtml(
      order.orderCode || order.order_code || order.orderId || order.id
    )}
        </div>
        <div class="order-meta">
          Ngày đặt: ${created || "Chưa rõ"}
          ${order.paymentMethod
        ? " | Thanh toán: " + escapeHtml(order.paymentMethod)
        : ""
      }
        </div>
      </div>
      <div class="order-summary">
        <span class="order-summary-total">${formatCurrency(totalAmount)}</span>
        <span class="order-status ${statusClass}">
          ${escapeHtml(statusText)}
        </span>
      </div>
    `;
    card.appendChild(header);

    // ===== ITEMS - Collapsible =====
    const itemsWrap = document.createElement("div");
    itemsWrap.className = "order-items";

    const items =
      order.orderItems || order.items || order.order_items || [];

    if (!items || items.length === 0) {
      const emptyItem = document.createElement("div");
      emptyItem.className = "order-item order-item-empty";
      emptyItem.textContent = "Đơn hàng không có sản phẩm.";
      itemsWrap.appendChild(emptyItem);
    } else {
      items.forEach((item) => {
        const product = item.product || {};
        const name =
          item.productName ||
          product.productName ||
          product.name ||
          "Sản phẩm";

        const qty = item.quantity || item.qty || 0;
        const unitPrice =
          item.unitPrice ||
          item.price ||
          product.price ||
          0;

        const imageUrl = resolveProductImage(item, product);
        const imgHtml = imageUrl
          ? `<img src="${imageUrl}" alt="${escapeHtml(name)}" />`
          : "";

        const itemEl = document.createElement("div");
        itemEl.className = "order-item";
        itemEl.innerHTML = `
          <div class="order-item-left">
            <div class="order-item-image">
              ${imgHtml}
            </div>
            <div class="order-item-main">
              <div class="order-item-name">${escapeHtml(name)}</div>
              <div class="order-item-meta">Số lượng: ${qty} × ${formatCurrency(unitPrice)}</div>
            </div>
          </div>
          <div class="order-item-right">
            <div class="order-item-unit-price">
              ${formatCurrency(unitPrice * qty)}
            </div>
          </div>
        `;
        itemsWrap.appendChild(itemEl);
      });
    }

    card.appendChild(itemsWrap);

    // ===== FOOTER: ACTION BUTTONS =====
    const footer = document.createElement("div");
    footer.className = "order-footer";

    // Add action buttons based on status
    if (statusKey === "SHIPPING" || statusKey === "SHIPPED") {
      const btnConfirm = document.createElement("button");
      btnConfirm.className = "btn-confirm-receipt";
      btnConfirm.textContent = "Đã nhận hàng";
      btnConfirm.addEventListener("click", () => confirmReceipt(order.id || order.orderId));
      footer.appendChild(btnConfirm);
    } else if (statusKey === "CONFIRMED" || statusKey === "PENDING" || statusKey === "NEW") {
      const btnCancel = document.createElement("button");
      btnCancel.className = "btn-cancel-order";
      btnCancel.textContent = "Hủy đơn";
      btnCancel.addEventListener("click", () => cancelOrder(order.id || order.orderId));
      footer.appendChild(btnCancel);
    }

    const btnDetails = document.createElement("button");
    btnDetails.className = "btn-view-details";
    btnDetails.innerHTML = `
      Xem chi tiết
      <span class="arrow">▼</span>
    `;

    btnDetails.addEventListener("click", () => {
      const isExpanded = itemsWrap.classList.toggle("expanded");
      btnDetails.classList.toggle("expanded", isExpanded);
      btnDetails.innerHTML = isExpanded
        ? `Ẩn chi tiết <span class="arrow">▼</span>`
        : `Xem chi tiết <span class="arrow">▼</span>`;
    });

    footer.appendChild(btnDetails);
    card.appendChild(footer);

    container.appendChild(card);
  });
}

// 7. LẤY URL ẢNH
function resolveProductImage(item, product) {
  let url = null;

  if (item.imageUrl) url = item.imageUrl;
  else if (product.thumbnail) url = product.thumbnail;
  else if (product.imageUrl) url = product.imageUrl;
  else if (
    Array.isArray(product.productImages) &&
    product.productImages.length > 0
  ) {
    const primary =
      product.productImages.find((img) => img.isPrimary) ||
      product.productImages[0];
    if (primary && primary.imageUrl) url = primary.imageUrl;
  }

  if (!url) return null;
  url = String(url).trim();
  return url.length ? url : null;
}

// 8. STATUS -> CLASS
function getStatusClass(status) {
  switch (status) {
    case "PENDING":
    case "NEW":
      return "pending";
    case "CONFIRMED":
    case "SHIPPED":
      return "confirmed";
    case "COMPLETED":
    case "PAID":
      return "completed";
    case "CANCELLED":
    case "CANCELED":
    case "FAILED":
      return "cancelled";
    default:
      return "pending";
  }
}

// 9. ĐỊNH DẠNG TIỀN
function formatCurrency(value) {
  const number = Number(value || 0);
  return number.toLocaleString("vi-VN") + "₫";
}

// 10. ĐỊNH DẠNG THỜI GIAN
function formatDateTime(str) {
  if (!str) return "";
  try {
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleString("vi-VN");
  } catch (e) {
    return str;
  }
}

// 11. CONFIRM RECEIPT (User confirms order received)
async function confirmReceipt(orderId) {
  if (!confirm("Xác nhận bạn đã nhận được hàng?")) return;

  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/complete`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Không thể cập nhật trạng thái đơn hàng");
    }

    alert("Đã xác nhận nhận hàng thành công!");
    loadOrders(); // Reload orders
  } catch (err) {
    console.error(err);
    alert("Lỗi: " + err.message);
  }
}

// 12. CANCEL ORDER
async function cancelOrder(orderId) {
  if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Không thể hủy đơn hàng");
    }

    alert("Đã hủy đơn hàng thành công!");
    loadOrders(); // Reload orders
  } catch (err) {
    console.error(err);
    alert("Lỗi: " + err.message);
  }
}

// 13. ESCAPE HTML
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
