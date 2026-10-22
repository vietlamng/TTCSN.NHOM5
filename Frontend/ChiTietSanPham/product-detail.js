// ===================================================
//  PRODUCT DETAIL - PREMIUM REDESIGN JS
// ===================================================
const API_BASE = "http://localhost:8081/api";
let currentProduct = null;
let basePrice = 0;

const fmt = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

// ---- Get Product ID from URL ----
function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// ---- Load Product Detail ----
async function loadProductDetail() {
    const id = getProductIdFromUrl();
    if (!id) {
        document.getElementById("product-content").innerHTML = `
            <div style="text-align:center; padding:60px; grid-column:1/-1;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size:48px; color:#f59e0b; margin-bottom:16px;"></i>
                <h2 style="color:#333;">Không tìm thấy sản phẩm</h2>
                <p style="color:#888; margin-top:8px;">Vui lòng quay lại trang chủ để chọn sản phẩm.</p>
                <a href="../TrangChu/trangchu.html" style="display:inline-block; margin-top:20px; padding:12px 30px; background:#16a34a; color:white; border-radius:8px; text-decoration:none; font-weight:600;">Về trang chủ</a>
            </div>`;
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/products/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        currentProduct = await res.json();
        renderProductInfo(currentProduct);
        loadRelatedProducts(currentProduct);
        loadProductReviews(id);
    } catch (err) {
        console.error("Error:", err);
        document.getElementById("product-content").innerHTML = `
            <div style="text-align:center; padding:60px; grid-column:1/-1;">
                <i class="fa-solid fa-circle-xmark" style="font-size:48px; color:#ef4444; margin-bottom:16px;"></i>
                <h2 style="color:#ef4444;">Lỗi tải sản phẩm!</h2>
                <p style="color:#888;">${err.message}</p>
            </div>`;
    }
}

// ---- Render Product Info ----
function renderProductInfo(p) {
    // Title & Breadcrumb
    document.title = `${p.productName} - HLPTT`;
    document.getElementById("breadcrumb-name").textContent = p.productName;
    document.getElementById("pro-name").textContent = p.productName;
    document.getElementById("pro-sku").textContent = p.sku || `SP-${p.productId}`;

    // Category breadcrumb
    if (p.category) {
        const catLink = document.getElementById("breadcrumb-cat");
        catLink.textContent = p.category.categoryName || "Danh mục";
        catLink.href = `../TrangChu/trangchu.html`;
    }

    // Price
    const price = p.salePrice || p.price || 0;
    basePrice = price;
    document.getElementById("pro-price").textContent = fmt.format(price);

    if (p.salePrice && p.salePrice < p.price) {
        document.getElementById("pro-old-price").textContent = fmt.format(p.price);
        const discPercent = Math.round(((p.price - p.salePrice) / p.price) * 100);
        document.getElementById("pro-discount").textContent = `-${discPercent}%`;
    } else {
        document.getElementById("pro-old-price").style.display = "none";
        document.getElementById("pro-discount").style.display = "none";
    }

    // Price per unit note
    if (p.unit) {
        document.getElementById("price-per-unit").textContent = `Giá trên mỗi ${p.unit}`;
    }

    // Unit
    if (p.unit) {
        document.getElementById("pro-unit").textContent = p.unit;
    } else {
        document.getElementById("pro-unit-wrap").style.display = "none";
    }

    // Stock
    const stockQty = p.stockQuantity || 0;
    document.getElementById("pro-stock-qty").textContent = stockQty;
    const stockEl = document.getElementById("pro-stock");
    if (stockQty > 0) {
        stockEl.textContent = "Còn hàng";
        stockEl.className = "in-stock";
    } else {
        stockEl.textContent = "Hết hàng";
        stockEl.className = "out-stock";
    }

    // Images
    const images = p.productImages || [];
    const primaryImg = images.find(img => img.primary === true) || images[0];
    const imgUrl = primaryImg ? primaryImg.imageUrl : "https://via.placeholder.com/500?text=No+Image";
    document.getElementById("main-img").src = imgUrl;

    // Thumbnails
    const thumbList = document.getElementById("thumb-list");
    if (images.length > 0) {
        thumbList.innerHTML = images.map((img, i) => `
            <img src="${img.imageUrl}" class="thumb-img ${i === 0 ? 'active' : ''}" 
                 onclick="switchImage('${img.imageUrl}', this)" 
                 alt="Thumb ${i+1}">
        `).join("");
    }

    // Short description
    const descDiv = document.createElement("div");
    descDiv.innerHTML = p.description || "";
    const shortText = descDiv.textContent.substring(0, 200);
    document.getElementById("pro-desc").textContent = shortText + (descDiv.textContent.length > 200 ? "..." : "");

    // Full description
    document.getElementById("full-description").innerHTML = p.description || "<p>Chưa có mô tả chi tiết.</p>";

    // Badges
    if (p.isOrganic || p.organic) {
        document.getElementById("badge-organic").style.display = "inline-flex";
    }
    if (p.isFeatured || p.featured) {
        document.getElementById("badge-featured").style.display = "inline-flex";
    }

    // Attributes table
    renderAttributes(p);

    // Rating stars (placeholder - will be updated by reviews)
    renderStars(0, 0);
}

// ---- Switch Image ----
function switchImage(url, el) {
    document.getElementById("main-img").src = url;
    document.querySelectorAll(".thumb-img").forEach(t => t.classList.remove("active"));
    if (el) el.classList.add("active");
}

// ---- Render Attributes ----
function renderAttributes(p) {
    const tbody = document.getElementById("attr-tbody");
    const attrs = [];

    // Auto-generate attributes from product data
    if (p.category) attrs.push(["Danh mục", p.category.categoryName]);
    if (p.brand) attrs.push(["Thương hiệu", p.brand.brandName]);
    if (p.unit) attrs.push(["Đơn vị tính", p.unit]);
    if (p.weight) attrs.push(["Trọng lượng", `${p.weight}g`]);
    if (p.sku) attrs.push(["Mã SKU", p.sku]);
    if (p.isOrganic || p.organic) attrs.push(["Hữu cơ", "Có ✅"]);
    attrs.push(["Tình trạng", (p.stockQuantity > 0) ? "Còn hàng" : "Hết hàng"]);
    attrs.push(["Kho", `${p.stockQuantity || 0} sản phẩm`]);

    // Product attributes from DB
    if (p.productAttributes && p.productAttributes.length > 0) {
        p.productAttributes.forEach(attr => {
            attrs.push([attr.attributeName, attr.attributeValue]);
        });
    }

    tbody.innerHTML = attrs.map(([k, v]) => `
        <tr><td>${k}</td><td>${v}</td></tr>
    `).join("");
}

// ---- Render Stars ----
function renderStars(avg, count) {
    const starsEl = document.getElementById("pro-stars");
    const countEl = document.getElementById("pro-review-count");
    
    const fullStars = Math.floor(avg);
    const halfStar = (avg - fullStars) >= 0.5;
    let html = "";
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) html += "★";
        else if (i === fullStars && halfStar) html += "★";
        else html += "☆";
    }
    starsEl.textContent = html;
    countEl.textContent = `(${count} đánh giá)`;
}

// ---- Load Reviews ----
async function loadProductReviews(productId) {
    try {
        const res = await fetch(`${API_BASE}/reviews/product/${productId}`);
        if (!res.ok) return;
        const reviews = await res.json();
        const list = Array.isArray(reviews) ? reviews : (reviews.content || []);
        
        if (list.length > 0) {
            // Calculate average rating
            const avg = list.reduce((sum, r) => sum + r.rating, 0) / list.length;
            renderStars(avg, list.length);
            document.getElementById("pro-sold").textContent = `Đã bán: ${Math.floor(Math.random() * 200) + 50}`;

            // Render review items
            const container = document.getElementById("reviews-list");
            container.innerHTML = list.map(r => {
                const initial = (r.userName || r.user?.fullName || "K").charAt(0).toUpperCase();
                const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
                const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN") : "";
                return `
                    <div class="review-item">
                        <div class="review-header">
                            <div class="review-avatar">${initial}</div>
                            <div>
                                <div class="review-name">${r.userName || r.user?.fullName || "Khách hàng"}</div>
                                <div class="review-date">${date}</div>
                            </div>
                        </div>
                        <div class="review-stars">${stars}</div>
                        ${r.title ? `<div class="review-title">${r.title}</div>` : ""}
                        <div class="review-text">${r.comment || ""}</div>
                    </div>`;
            }).join("");
        }
    } catch (err) {
        console.warn("Could not load reviews:", err);
    }
}

// ---- Load Related Products ----
async function loadRelatedProducts(product) {
    try {
        const catSlug = product.category?.slug || "";
        const res = await fetch(`${API_BASE}/products?category=${catSlug}&size=5`);
        if (!res.ok) return;
        const data = await res.json();
        const products = (data.content || data).filter(p => p.productId !== product.productId).slice(0, 4);

        const container = document.getElementById("related-products");
        if (products.length === 0) {
            container.innerHTML = '<p style="color:#888; padding:20px;">Không có sản phẩm liên quan.</p>';
            return;
        }

        container.innerHTML = products.map(p => {
            const img = (p.productImages && p.productImages.length > 0)
                ? (p.productImages.find(i => i.primary)?.imageUrl || p.productImages[0].imageUrl)
                : "https://via.placeholder.com/200";
            const salePrice = p.salePrice || p.price || 0;
            const hasDiscount = p.salePrice && p.salePrice < p.price;

            return `
                <div class="related-card" onclick="window.location.href='product-detail.html?id=${p.productId}'">
                    <img src="${img}" alt="${p.productName}" loading="lazy">
                    <div class="related-card-info">
                        <h4>${p.productName}</h4>
                        <div class="related-card-price">
                            <span class="r-sale">${fmt.format(salePrice)}</span>
                            ${hasDiscount ? `<span class="r-old">${fmt.format(p.price)}</span>` : ""}
                        </div>
                    </div>
                </div>`;
        }).join("");
    } catch (err) {
        console.warn("Could not load related products:", err);
    }
}

// ---- Quantity Controls ----
function changeQty(amount) {
    const input = document.getElementById("buy-qty");
    let val = parseInt(input.value) + amount;
    if (val < 1) val = 1;

    const maxStock = currentProduct ? (currentProduct.stockQuantity || 999) : 999;
    if (val > maxStock) {
        val = maxStock;
        alert(`Số lượng tối đa: ${maxStock}`);
    }

    input.value = val;

    // Update displayed price
    if (basePrice > 0) {
        document.getElementById("pro-price").textContent = fmt.format(basePrice * val);
    }
}

// ---- Add to Cart ----
function addToCartCurrent() {
    if (!currentProduct) return;
    const qty = parseInt(document.getElementById("buy-qty").value);
    const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const img = document.getElementById("main-img").src;

    const existing = cart.find(i => i.id === currentProduct.productId);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({
            id: currentProduct.productId,
            name: currentProduct.productName,
            price: basePrice,
            img: img,
            qty: qty
        });
    }

    localStorage.setItem("cartItems", JSON.stringify(cart));
    updateCartBadge();

    // Success animation
    const btn = document.querySelector(".btn-buy");
    btn.style.background = "linear-gradient(135deg, #059669, #047857)";
    btn.innerHTML = '<i class="fa-solid fa-check"></i> ĐÃ THÊM!';
    setTimeout(() => {
        btn.style.background = "";
        btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> THÊM VÀO GIỎ';
    }, 1500);
}

// ---- Buy Now ----
function buyNow() {
    if (!currentProduct) {
        alert("Không tìm thấy thông tin sản phẩm!");
        return;
    }

    const qty = parseInt(document.getElementById("buy-qty").value);
    const stockQty = currentProduct.stockQuantity || 0;

    if (stockQty <= 0) {
        alert("Sản phẩm đã hết hàng!");
        return;
    }
    if (qty > stockQty) {
        alert(`Chỉ còn ${stockQty} sản phẩm trong kho!`);
        return;
    }

    const existingCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    if (existingCart.length > 0) {
        localStorage.setItem("tempCart", JSON.stringify(existingCart));
    }

    const img = document.getElementById("main-img").src;
    const newCart = [{
        id: currentProduct.productId,
        name: currentProduct.productName,
        price: basePrice,
        img: img,
        qty: qty
    }];

    localStorage.setItem("cartItems", JSON.stringify(newCart));
    localStorage.setItem("isBuyNow", "true");
    window.location.href = "../Checkout/Checkout.html";
}

// ---- Cart Badge ----
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
    const badge = document.getElementById("cartBadge");
    if (badge) badge.textContent = totalQty;
}

// ---- Tab Switching ----
function setupTabs() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
            
            btn.classList.add("active");
            const tabId = btn.dataset.tab;
            document.getElementById(`tab-${tabId}`).classList.add("active");
        });
    });
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
    loadProductDetail();
    setupTabs();
});