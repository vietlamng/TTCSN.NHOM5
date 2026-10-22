/**
 * GioHang.js - Premium Cart Logic
 */

if (typeof API_BASE === 'undefined') {
  var API_BASE = "http://localhost:8081/api";
}

const cartFmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

function getToken() {
  return localStorage.getItem("hlpttToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt");
}

function getCart() {
  try { return JSON.parse(localStorage.getItem("cartItems")) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem("cartItems", JSON.stringify(cart));
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ---- RENDER CART ----
function renderCart() {
  const cart = getCart();
  const content = document.getElementById("cartContent");
  if (!content) return;

  // Empty cart
  if (cart.length === 0) {
    content.innerHTML = `
      <div class="cart-empty-box">
        <div class="cart-empty-icon"><i class="fa-solid fa-cart-shopping"></i></div>
        <div class="cart-empty-text">Giỏ hàng của bạn đang trống</div>
        <div class="cart-empty-sub">Hãy khám phá các sản phẩm tươi ngon của chúng tôi!</div>
        <a href="../TrangChu/trangchu.html" class="cart-shop-btn">
          <i class="fa-solid fa-store"></i> Tiếp tục mua sắm
        </a>
      </div>
      <div class="cart-benefits">
        <div class="benefit-item">
          <div class="benefit-icon"><i class="fa-solid fa-truck-fast"></i></div>
          <div class="benefit-text"><h4>Giao hàng nhanh</h4><p>Trong 2 giờ nội thành</p></div>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon"><i class="fa-solid fa-shield-halved"></i></div>
          <div class="benefit-text"><h4>100% chính hãng</h4><p>Cam kết chất lượng</p></div>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon"><i class="fa-solid fa-rotate-left"></i></div>
          <div class="benefit-text"><h4>Đổi trả dễ dàng</h4><p>Hoàn tiền trong 7 ngày</p></div>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon"><i class="fa-solid fa-headset"></i></div>
          <div class="benefit-text"><h4>Hỗ trợ 24/7</h4><p>Hotline: 0794704856</p></div>
        </div>
      </div>`;
    return;
  }

  // Cart header count
  const titleEl = document.querySelector('.cart-title');
  if (titleEl) {
    titleEl.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Giỏ hàng <span class="cart-count">${cart.length} sản phẩm</span>`;
  }

  // Cart items
  let itemsHtml = '<div class="cart-items-list">';
  cart.forEach((item, idx) => {
    const subtotal = item.price * item.qty;
    const imgSrc = item.img || 'https://via.placeholder.com/90?text=SP';
    itemsHtml += `
      <div class="cart-item">
        <img src="${imgSrc}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <div class="cart-item-price">${cartFmt.format(item.price)}</div>
        </div>
        <div class="cart-qty-box">
          <button class="cart-qty-btn" onclick="updateQty(${idx}, ${item.qty - 1})">−</button>
          <input type="text" class="cart-qty-input" value="${item.qty}" onchange="updateQty(${idx}, this.value)" readonly>
          <button class="cart-qty-btn" onclick="updateQty(${idx}, ${item.qty + 1})">+</button>
        </div>
        <div class="cart-item-subtotal">${cartFmt.format(subtotal)}</div>
        <button class="cart-remove-btn" onclick="removeFromCart(${idx})" title="Xóa">✕</button>
      </div>`;
  });
  itemsHtml += '</div>';

  // Calculations
  const subtotal = getCartTotal();
  const discountAmount = parseFloat(localStorage.getItem("discountAmount")) || 0;
  const appliedPercent = parseFloat(localStorage.getItem("appliedCouponPercent")) || 0;
  const finalAmount = Math.max(0, subtotal - discountAmount);

  // Bottom section
  const bottomHtml = `
    <div class="cart-bottom">
      <div class="coupon-box">
        <h3><i class="fa-solid fa-ticket"></i> Mã giảm giá</h3>
        <div class="coupon-input-row">
          <input type="text" id="couponInput" class="coupon-input" placeholder="Nhập mã giảm giá..." value="${localStorage.getItem('appliedCoupon') || ''}">
          <button onclick="applyCoupon()" class="coupon-apply-btn"><i class="fa-solid fa-check"></i> Áp dụng</button>
        </div>
        <div id="couponMsg"></div>
        <div class="coupon-badges">
          <span class="coupon-badge" data-code="BEA50">BEA50</span>
          <span class="coupon-badge" data-code="SALE20">SALE20</span>
        </div>
      </div>

      <div class="summary-box">
        <h3><i class="fa-solid fa-receipt"></i> Tổng đơn hàng</h3>
        <div class="summary-row">
          <span>Tạm tính (${cart.length} sản phẩm)</span>
          <span>${cartFmt.format(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span><i class="fa-solid fa-truck"></i> Phí vận chuyển</span>
          <span style="color:#16a34a; font-weight:600;">Miễn phí</span>
        </div>
        ${discountAmount > 0 ? `
          <div class="summary-row discount">
            <span><i class="fa-solid fa-tag"></i> Giảm giá${appliedPercent > 0 ? ' (' + appliedPercent + '%)' : ''}</span>
            <span>-${cartFmt.format(discountAmount)}</span>
          </div>` : ''}
        <div class="summary-row total">
          <span>Thành tiền</span>
          <span>${cartFmt.format(finalAmount)}</span>
        </div>
        <button onclick="checkout()" class="checkout-btn">
          <i class="fa-solid fa-lock"></i> TIẾN HÀNH THANH TOÁN
        </button>
      </div>
    </div>

    <div class="cart-benefits">
      <div class="benefit-item">
        <div class="benefit-icon"><i class="fa-solid fa-truck-fast"></i></div>
        <div class="benefit-text"><h4>Giao hàng nhanh</h4><p>Trong 2 giờ nội thành</p></div>
      </div>
      <div class="benefit-item">
        <div class="benefit-icon"><i class="fa-solid fa-shield-halved"></i></div>
        <div class="benefit-text"><h4>100% chính hãng</h4><p>Cam kết chất lượng</p></div>
      </div>
      <div class="benefit-item">
        <div class="benefit-icon"><i class="fa-solid fa-rotate-left"></i></div>
        <div class="benefit-text"><h4>Đổi trả dễ dàng</h4><p>Hoàn tiền trong 7 ngày</p></div>
      </div>
      <div class="benefit-item">
        <div class="benefit-icon"><i class="fa-solid fa-headset"></i></div>
        <div class="benefit-text"><h4>Hỗ trợ 24/7</h4><p>Hotline: 0794704856</p></div>
      </div>
    </div>`;

  content.innerHTML = itemsHtml + bottomHtml;
  setupCouponEvents(content);
  updateCartBadge();
}

// ---- COUPON ----
function setupCouponEvents(content) {
  try {
    const applied = localStorage.getItem('appliedCoupon');
    content.querySelectorAll('.coupon-badge').forEach(b => {
      if (applied && (b.dataset.code || b.textContent.trim()) === applied) {
        b.style.background = '#dcfce7';
        b.style.borderColor = '#16a34a';
        b.style.borderStyle = 'solid';
      }
      b.addEventListener('click', () => {
        const input = document.getElementById('couponInput');
        if (input) input.value = b.dataset.code || b.textContent.trim();
        applyCoupon();
      });
    });
  } catch (e) { console.warn(e); }
}

// ---- QTY / REMOVE ----
function updateQty(idx, qty) {
  const cart = getCart();
  let index = parseInt(idx, 10);
  const newQty = parseInt(qty, 10);

  if (Number.isNaN(index) || index < 0 || index >= cart.length) {
    index = cart.findIndex(i => i.id === idx || String(i.id) === String(idx));
  }
  if (index === -1) return;

  if (Number.isNaN(newQty) || newQty <= 0) {
    if (confirm("Xóa sản phẩm này khỏi giỏ?")) cart.splice(index, 1);
    else { renderCart(); return; }
  } else {
    cart[index].qty = newQty;
  }
  saveCart(cart);
  renderCart();
}

function removeFromCart(idx) {
  if (!confirm("Bạn chắc chắn muốn xóa?")) return;
  const cart = getCart();
  let index = parseInt(idx, 10);
  if (Number.isNaN(index) || index < 0 || index >= cart.length) {
    index = cart.findIndex(i => i.id === idx || String(i.id) === String(idx));
  }
  if (index === -1) return;
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

if (typeof window.updateCartItem === 'undefined') {
  window.updateCartItem = function (id, newQty) {
    try {
      const cart = getCart();
      const idx = cart.findIndex(i => i.id === id || String(i.id) === String(id));
      if (idx === -1) return;
      const qty = parseInt(newQty, 10);
      if (qty <= 0) cart.splice(idx, 1);
      else cart[idx].qty = qty;
      saveCart(cart);
      renderCart();
    } catch (e) { console.error('Lỗi updateCartItem', e); }
  };
}

// ---- COUPON LOGIC ----
async function applyCoupon() {
  const couponCode = document.getElementById("couponInput").value.trim();
  const couponMsg = document.getElementById("couponMsg");
  const subtotal = getCartTotal();
  if (!couponCode || subtotal === 0) return;

  try {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ couponCode, totalAmount: subtotal })
    });
    const data = await res.json();
    if (data.valid) {
      localStorage.setItem("appliedCoupon", couponCode);
      localStorage.setItem("discountAmount", data.discountAmount || 0);
      localStorage.setItem("appliedCouponPercent", data.discountPercent || 0);
      if (couponMsg) couponMsg.innerHTML = `<span style="color:#16a34a; font-weight:600;"><i class="fa-solid fa-circle-check"></i> ${data.message}</span>`;
      renderCart();
    } else {
      localStorage.removeItem("appliedCoupon");
      localStorage.removeItem("discountAmount");
      if (couponMsg) couponMsg.innerHTML = `<span style="color:#ef4444; font-weight:600;"><i class="fa-solid fa-circle-xmark"></i> ${data.message}</span>`;
      renderCart();
    }
  } catch {
    const pm = couponCode.match(/^\s*(?:P|SALE)?(\d{1,2})\s*%?$|^(\d{1,2})%$/i);
    if (pm) {
      const p = parseInt(pm[1] || pm[2], 10);
      if (p > 0 && p <= 100) {
        const discount = Math.floor(subtotal * (p / 100));
        localStorage.setItem("appliedCoupon", couponCode);
        localStorage.setItem("discountAmount", discount);
        localStorage.setItem("appliedCouponPercent", p);
        if (couponMsg) couponMsg.innerHTML = `<span style="color:#16a34a; font-weight:600;"><i class="fa-solid fa-circle-check"></i> Giảm ${p}% (Offline)</span>`;
        renderCart();
      }
    }
  }
}

// ---- CHECKOUT ----
function checkout() {
  const cart = getCart();
  if (cart.length === 0) { alert('Giỏ hàng rỗng!'); return; }

  const token = getToken();
  if (!token) {
    if (confirm("Bạn cần đăng nhập để thanh toán. Chuyển đến trang đăng nhập?")) {
      window.location.href = '../LogReg/LogRegUI.html';
    }
    return;
  }
  window.location.href = '../Checkout/Checkout.html';
}

// ---- BADGE ----
function updateCartBadge() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  document.querySelectorAll(".badge, #cartBadge").forEach(b => { if (b) b.textContent = totalQty; });
}

// ---- INIT ----
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { updateCartBadge(); setTimeout(renderCart, 100); });
} else {
  updateCartBadge();
  setTimeout(renderCart, 100);
}
