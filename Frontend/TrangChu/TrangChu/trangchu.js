// ================= CẤU HÌNH API =================
// Initialize a single global API_BASE on window without causing duplicate-declaration errors.
if (typeof window.API_BASE === 'undefined') {
  window.API_BASE = 'http://localhost:8081/api';
}
// Try to create a non-lexical global alias `API_BASE` only when it's not already declared.
try {
  if (typeof API_BASE === 'undefined') API_BASE = window.API_BASE;
} catch (e) {
  // If `API_BASE` is a const declared elsewhere, leave it as-is.
}

// ================= 1. QUẢN LÝ CHUYỂN TRANG (SPA LOGIC - KHÔI PHỤC TỪ CODE CŨ) =================
const homePageEl = document.getElementById("homePage");
const aboutPageEl = document.getElementById("aboutPage");
const cartPageEl = document.getElementById("cartPage");
const contactPageEl = document.getElementById("lienHePage");
const questionPageEl = document.getElementById("questionPage");
const productPageEl = document.getElementById("sanphamPage");
const inforPageEl = document.getElementById("tintucPage"); // Nếu HTML có id này

// Các biến trạng thái để tránh load lại nhiều lần
let aboutLoaded = false;
let cartLoaded = false;
let contactLoaded = false;
let questionLoaded = false;
let productLoaded = false;
let inforLoaded = false;

// Hàm ẩn tất cả các trang
function hideAllPages() {
  const pages = [homePageEl, aboutPageEl, cartPageEl, contactPageEl, questionPageEl, productPageEl, inforPageEl];
  pages.forEach(el => {
    if (el) el.classList.add("hidden");
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Hàm tải HTML cho các trang con
async function loadPageHtml(url, element, loadedFlag, scriptUrl = null) {
  if (loadedFlag) return true;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    // Lấy phần body hoặc toàn bộ text
    const tmp = document.createElement("html");
    tmp.innerHTML = text;
    const bodyEl = tmp.querySelector("body");
    element.innerHTML = bodyEl ? bodyEl.innerHTML : text;

    // Nếu có script riêng cho trang đó -> load và chờ script hoàn tất trước khi trả về
    if (scriptUrl) {
      await new Promise((resolve) => {
        const s = document.createElement("script");
        s.src = scriptUrl;
        s.defer = false; // Chạy ngay
        s.onload = () => {
          // small delay to allow any immediate initialization to run
          setTimeout(resolve, 0);
        };
        s.onerror = (e) => {
          console.error(`Không load được script ${scriptUrl}`, e);
          // resolve anyway so page still renders (but log error)
          resolve();
        };
        document.body.appendChild(s);
      });
    }
    return true;
  } catch (err) {
    console.error(`Lỗi tải trang ${url}:`, err);
    element.innerHTML = `<p style="padding:20px;color:red;text-align:center;">Không tải được nội dung. Vui lòng thử lại.</p>`;
    return false;
  }
}

// Lắng nghe sự kiện click menu
document.querySelectorAll("[data-page]").forEach((el) => {
  el.addEventListener("click", async (e) => {
    e.preventDefault();
    const page = el.dataset.page;

    // Active menu
    document.querySelectorAll(".nav-link").forEach((link) => link.classList.remove("active"));
    if (el.classList.contains("nav-link")) el.classList.add("active");

    hideAllPages();

    if (page === "home") {
      homePageEl.classList.remove("hidden");
      // Không cần gọi lại setupSearchFunctionality() vì đã có flag
    }
    else if (page === "about") {
      aboutPageEl.classList.remove("hidden");
      aboutLoaded = await loadPageHtml("/Frontend/GioiThieu/GioiThieu.html", aboutPageEl, aboutLoaded);
    }
    else if (page === "cart_Page") {
      cartPageEl.classList.remove("hidden");
      // Use a relative path so file:// views and different server roots work.
      // Also load the page-specific script so any inline logic (or auto-seed) runs.
      cartLoaded = await loadPageHtml("../GioHang/GioHang.html", cartPageEl, cartLoaded, "../GioHang/GioHang.js");
      renderCartPage(); // Hàm render giỏ hàng từ localStorage (ở phần dưới)
    }
    else if (page === "contact") {
      contactPageEl.classList.remove("hidden");
      contactLoaded = await loadPageHtml("/Frontend/LienHe/contact.html", contactPageEl, contactLoaded);
    }
    else if (page === "question-page") {
      questionPageEl.classList.remove("hidden");
      // Lưu ý: Bạn đang dùng file TinTuc cho question page trong code cũ
      questionLoaded = await loadPageHtml("/Frontend/TinTuc/TinTuc.html", questionPageEl, questionLoaded, "/Frontend/TinTuc/tintuc.js");
    }
    else if (page === "product-page") {
      productPageEl.classList.remove("hidden");
      
      // Kiểm tra xem có từ khóa tìm kiếm không
      const hasSearchKeyword = localStorage.getItem('searchKeyword');
      
      // Nếu đã load trang sản phẩm rồi nhưng có từ khóa mới, cần refresh lại
      if (productLoaded && hasSearchKeyword && typeof window.initProductPage === 'function') {
        console.log('🔄 Refresh trang sản phẩm với từ khóa:', hasSearchKeyword);
        await window.initProductPage();
      } else {
        // Load lần đầu
        productLoaded = await loadPageHtml("/Frontend/SanPham/sanpham.html", productPageEl, productLoaded, "/Frontend/SanPham/sanpham.js");
      }
    }
  });
});


// ================= 2. UTILS & HELPER (DÙNG CHO HOME API) =================
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

const getProductImage = (product) => {
  const placeholder = "https://via.placeholder.com/300x300?text=No+Image";
  if (!product.productImages || product.productImages.length === 0) return placeholder;
  const primaryInfo = product.productImages.find(img => img.primary === true);
  return primaryInfo ? primaryInfo.imageUrl : (product.productImages[0].imageUrl || placeholder);
};

function renderProductsToContainer(containerId, products) {
  const container = document.getElementById(containerId);

  // --- ĐOẠN KIỂM TRA LỖI ---
  if (!container) {
    console.error(`❌ LỖI TO: Không tìm thấy thẻ HTML nào có id="${containerId}"`);
    return;
  }

  if (!products || products.length === 0) {
    container.innerHTML = '<p style="text-align:center; width:100%; padding:20px;">Không có sản phẩm.</p>';
    return;
  }

  let html = "";
  products.forEach(p => {
    const price = p.price || 0;
    const salePrice = p.salePrice || price;
    const isSale = salePrice < price;
    const discountPercent = isSale ? Math.round(((price - salePrice) / price) * 100) : 0;
    const imgUrl = getProductImage(p);

    // Xử lý tên sản phẩm có dấu nháy đơn để không lỗi JS khi thêm vào giỏ
    const safeName = (p.productName || "").replace(/'/g, "\\'");

    html += `
        <div class="product-card" data-id="${p.productId}">
            ${isSale ? `<span class="product-badge">-${discountPercent}%</span>` : ''}
            
            <div class="product-thumb">
                <img src="${imgUrl}" alt="${p.productName}" class="product-image" loading="lazy"
                     onclick="goToProductDetail(${p.productId})" 
                     style="cursor: pointer;">
                
                <div class="product-quick">
                    <button class="qa-btn qa-eye" onclick="viewQuick(${p.productId})">👁️</button>
                    <button class="qa-btn qa-cart-quick" onclick="addToCartQuick(${p.productId}, '${safeName}', ${salePrice}, '${imgUrl}')">🛒</button>
                </div>
            </div>
            
            <h3 class="product-name" title="${p.productName}" 
                onclick="goToProductDetail(${p.productId})" 
                style="cursor: pointer;">
                ${p.productName}
            </h3>
            
            <div class="product-price">
                <span class="current-price">${formatCurrency(salePrice)}</span>
                ${isSale ? `<span class="old-price">${formatCurrency(price)}</span>` : ''}
            </div>
            
            <div class="product-actions">
                <button class="btn-add-cart" onclick="addToCartQuick(${p.productId}, '${safeName}', ${salePrice}, '${imgUrl}')">Thêm vào giỏ</button>
            </div>
        </div>`;
  });

  container.innerHTML = html;
  console.log(`✅ Đã vẽ ${products.length} sản phẩm vào #${containerId}`);
}

// ================= 3. GỌI API LOAD DỮ LIỆU HOME PAGE =================

// 1. Map ảnh tĩnh cho các danh mục (Dùng link mẫu hoặc link thật của bạn)
const categoryImages = {
  "rau-cu": "https://cdn.tgdd.vn/Files/2018/07/27/1104673/co-phai-an-nhieu-rau-cu-la-tot-202112301617596948.jpg", // Hoặc đường dẫn nội bộ của bạn
  "trai-cay": "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/30_loai_trai_cay_mien_Nam_4db0ad30c0.jpg",
  "thit": "https://fujimart.vn/wp-content/uploads/2024/06/Nac-vai-dam.png", // Ví dụ ảnh thịt
  "trung": "https://i1-vnexpress.vnecdn.net/2015/02/14/eggs-03-4600-1423905018.jpg?w=680&h=0&q=100&dpr=1&fit=crop&s=pV9DRuCrulqnhayFfwTCOg",
  "do-uong": "https://lamaca.vn/wp-content/uploads/2021/08//c%C3%A1ch-l%C3%A0m-mojito-2-840x500.jpg",
  "banh-va-sua": "https://afamilycdn.com/Qalypm8xccccccccccccW2vZ1VroR/Image/2012/10/04/121022afamily-AN-buttermilk-ciambella-(1)-c2cef.jpg",
  "hai-san": "https://cdn.tgdd.vn/2021/04/CookProduct/13-1200x676.jpg",
  "banh-mi": "http://www.uniflour.vn/upload/images/HT%20T%E1%BB%88NH%202019/IMG_7714.JPG",
  "salad": "https://cdn.tgdd.vn/2020/09/CookProduct/Salad-la-gi-phan-loai-salad-0-1200x676.jpg",
  "dau-thuc-vat": "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/dau_thuc_vat_04_0f56e15e61.webp",
  "gia-vi-do-kho": "https://thaptoanfood.com/thumbs/540x540x1/upload/product/untitled-12-7532-1294.png"
};

async function loadCategories() {
  const container = document.getElementById("categories-container");
  if (!container) return;

  try {
    const res = await fetch(`${window.API_BASE}/categories/highlights`);

    // Nếu HTTP != 2xx -> đọc body để log rồi throw
    if (!res.ok) {
      const ct = res.headers.get("content-type") || "";
      const body = ct.includes("application/json")
        ? JSON.stringify(await res.json())
        : (await res.text());

      throw new Error(`HTTP ${res.status} ${res.statusText} | ${body.slice(0, 250)}`);
    }

    const data = await res.json();

    // Hỗ trợ nhiều kiểu response: Array, Page(content), wrapper(data/result)
    const categories =
      Array.isArray(data) ? data :
        Array.isArray(data?.content) ? data.content :
          Array.isArray(data?.data) ? data.data :
            Array.isArray(data?.result) ? data.result :
              [];

    if (!Array.isArray(categories)) {
      throw new Error("Response không đúng format mảng categories");
    }

    let html = "";
    categories.forEach(cat => {
      const slug = cat.slug || "";
      const apiImage = cat.image || cat.imageUrl;
      const staticImage = categoryImages[slug];
      const defaultImg = "https://via.placeholder.com/100x100?text=Category";
      const finalImg = apiImage || staticImage || defaultImg;

      const name = cat.categoryName || cat.name || "Tên danh mục";
      const count = cat.productCount || cat.count || 0;

      html += `
        <div class="category-card" onclick="filterByCategory('${slug}')">
          <div class="cat-img-wrap">
            <img src="${finalImg}" alt="${name}" onerror="this.src='${defaultImg}'">
          </div>
          <h3>${name}</h3>
          <p>${count} sản phẩm</p>
        </div>`;
    });

    container.innerHTML = html;
  } catch (err) {
    console.error("Lỗi load danh mục:", err);
    container.innerHTML = `<p style="padding:12px;color:#d0021b">Không tải được danh mục.</p>`;
  }
}


// Thêm chức năng Scroll cho nút mũi tên
function scrollCategories(direction) {
  const container = document.getElementById("categories-container");
  if (container) {
    const scrollAmount = 300;
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
}

async function fetchProducts(endpoint, containerId) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error("Lỗi tải sản phẩm");
    const data = await res.json();
    const products = data.content ? data.content : data;
    renderProductsToContainer(containerId, products);
  } catch (err) { console.error(err); }
}

function initHomePageData() {
  console.log("🚀 Bắt đầu tải trang chủ...");

  // 1. Load Danh mục
  loadCategories();

  // 2. Setup Bán chạy
  setupBestSellerTabs();
  loadBestSellers("rau-cu");
  try {
    setupFarmTabs();
    loadFarmProducts("thit");

    console.log("✅ Đã gọi loadFarmProducts('thit')");
  } catch (e) {
    console.error("❌ Lỗi khi gọi Farm Tabs:", e);
  }

  // 4. Setup Hải sản
  try {
    setupSeafoodTabs();
    loadSeafoodProducts("hai-san");
  } catch (e) {
    console.error("❌ Lỗi khi gọi Seafood Tabs:", e);
  }

  // 5. Các mục khác
  fetchProducts("/products?sort=price,asc&size=6", "flashsale-container");
  fetchProducts("/products?sort=createdAt,desc&size=8", "new-products-container");

  // Các mục phụ
  fetchProducts("/products?category=gia-vi-do-kho&size=3", "dryfood-container");
  // fetchProducts("/products?category=do-uong&size=6", "drinks-container");
  fetchProducts("/products?category=gia-vi-do-kho&page=1&size=3", "noodle-container");
  // Thức uống (3 sản phẩm)
  fetchProducts("/products?category=do-uong&size=3", "drinks-container");
}

// Hàm lọc danh mục (kết nối với trang sản phẩm)
function filterByCategory(slug) {
  // Kích hoạt tab sản phẩm
  const productLink = document.querySelector('[data-page="product-page"]');
  if (productLink) {
    productLink.click();
    // Lưu slug vào localStorage để trang sanpham.js đọc và lọc
    localStorage.setItem("filterCategory", slug);
    setTimeout(() => {
      // Nếu bạn có hàm filter trong sanpham.js thì gọi ở đây, 
      // hoặc sanpham.js tự đọc localStorage khi load.
      console.log("Chuyển sang trang sản phẩm lọc: " + slug);
    }, 500);
  }
}

// ================= 4. QUẢN LÝ GIỎ HÀNG (CART LOGIC) =================
function getCart() {
  try { return JSON.parse(localStorage.getItem("cartItems")) || []; } catch (e) { return []; }
}
function saveCart(cart) {
  localStorage.setItem("cartItems", JSON.stringify(cart));
  updateCartBadge();
}
function updateCartBadge() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll(".badge").forEach(b => b.textContent = totalQty);
}

// Hàm thêm vào giỏ (Dùng cho cả Home và QuickView)
function addToCartQuick(id, name, price, img) {
  let cart = getCart();
  const found = cart.find((item) => item.id === id);
  if (found) {
    found.qty += 1;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  saveCart(cart);

  // Hiệu ứng animation nhẹ cho badge
  const badge = document.querySelector("#gioHang .badge");
  if (badge) {
    badge.style.transform = "scale(1.5)";
    setTimeout(() => badge.style.transform = "scale(1)", 200);
  }
  alert(`Đã thêm "${name}" vào giỏ hàng!`);
}
function renderCartPage() {
  const container = (cartPageEl && cartPageEl.querySelector)
    ? (cartPageEl.querySelector("#cartItemsContainer") || cartPageEl.querySelector("#cartContent"))
    : (document.querySelector("#cartItemsContainer") || document.querySelector("#cartContent"));


  if (typeof window.renderCart === 'function') {
    try { window.renderCart(); } catch (e) { console.error('renderCart() failed', e); }
    return;
  }

  if (!container) return;

  const cart = getCart();

  // 1. TRƯỜNG HỢP GIỎ HÀNG TRỐNG
  if (!cart || cart.length === 0) {
    container.innerHTML = `
            <div style="text-align:center; padding: 60px 20px; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                <img src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/cart/9bdd8040b334d31946f49e36beaf32db.png" 
                     style="width: 120px; opacity: 0.8; margin-bottom: 20px;">
                <p style="font-size: 16px; color: #666; margin-bottom: 30px;">Giỏ hàng của bạn đang trống!</p>
                <a href="#" onclick="document.querySelector('[data-page=home]').click()" 
                   style="background: #008848; color: white; padding: 12px 40px; border-radius: 30px; text-decoration: none; font-weight: 700; box-shadow: 0 4px 10px rgba(0,136,72,0.3);">
                   Tiếp tục mua sắm
                </a>
            </div>`;
    return;
  }

  let listHtml = "";
  let total = 0;

  cart.forEach(item => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;

    // Dùng Grid để chia cột cho từng hàng sản phẩm
    listHtml += `
        <div class="cart-item-row" style="display: grid; grid-template-columns: 80px 2fr 1fr 1fr 1fr 40px; gap: 15px; align-items: center; padding: 20px 0; border-bottom: 1px solid #f0f0f0;">
            <img src="${item.img}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #eee;">
            
            <div style="font-weight: 600; color: #333; font-size: 15px;">${item.name}</div>

            <div style="font-weight: 600; color: #333;">${formatCurrency(item.price)}</div>

            <div style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 5px; width: fit-content; overflow: hidden;">
                <button onclick="updateCartItem(${item.id}, ${item.qty - 1})" 
                        style="width: 30px; height: 30px; border: none; background: #f9f9f9; cursor: pointer; font-weight:bold;">-</button>
                <input type="text" value="${item.qty}" readonly 
                       style="width: 35px; text-align: center; border: none; outline: none; font-weight: 600; font-size: 14px;">
                <button onclick="updateCartItem(${item.id}, ${item.qty + 1})" 
                        style="width: 30px; height: 30px; border: none; background: #f9f9f9; cursor: pointer; font-weight:bold;">+</button>
            </div>

            <div style="font-weight: 700; color: #d0021b; text-align: right;">${formatCurrency(lineTotal)}</div>

            <button onclick="removeCartItem(${item.id})" 
                    style="color: #999; background: none; border: none; cursor: pointer; font-size: 18px; transition: color 0.2s;" 
                    onmouseover="this.style.color='#d0021b'" onmouseout="this.style.color='#999'" title="Xóa">
                🗑️
            </button>
        </div>`;
  });

  // HTML Tổng thể (Khung bao ngoài)
  container.innerHTML = `
    <div class="cart-layout" style="display: grid; grid-template-columns: 2.5fr 1fr; gap: 30px; align-items: start;">
        
        <div class="cart-left" style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
            <div style="display: grid; grid-template-columns: 80px 2fr 1fr 1fr 1fr 40px; gap: 15px; padding-bottom: 15px; border-bottom: 2px solid #eee; font-weight: 700; color: #555; font-size: 14px;">
                <div>Ảnh</div>
                <div>Tên sản phẩm</div>
                <div>Đơn giá</div>
                <div>Số lượng</div>
                <div style="text-align: right;">Thành tiền</div>
                <div></div>
            </div>
            
            ${listHtml}
            
            <div style="text-align: right; padding-top: 25px;">
                <div style="font-size: 16px; color: #555; margin-bottom: 10px;">Tổng cộng:</div>
                <div style="font-size: 28px; font-weight: 800; color: #d0021b; margin-bottom: 20px;">${formatCurrency(total)}</div>
                <button style="background: #008848; color: white; border: none; padding: 15px 50px; border-radius: 8px; font-weight: 700; font-size: 16px; cursor: pointer; transition: background 0.2s; box-shadow: 0 4px 15px rgba(0,136,72,0.2);"
                        onmouseover="this.style.background='#006d3a'" onmouseout="this.style.background='#008848'">
                    THANH TOÁN
                </button>
            </div>
        </div>

        <div class="cart-right" style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); position: sticky; top: 90px;">
            <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700;">Thời gian giao hàng</h3>
            
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <input type="text" id="datePicker" placeholder="Chọn ngày" 
                       style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 6px; outline: none;">
                
                <select style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 6px; outline: none; background: white;">
                    <option>Chọn giờ</option>
                    <option>08:00 - 12:00</option>
                    <option>13:00 - 17:00</option>
                    <option>17:00 - 20:00</option>
                </select>
            </div>

            <div style="margin-bottom: 25px; display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="invoice" style="width: 16px; height: 16px;"> 
                <label for="invoice" style="cursor: pointer; font-size: 14px; color: #333;">Xuất hóa đơn công ty</label>
            </div>

            <h3 style="margin-bottom: 15px; font-size: 15px; font-weight: 600;">Mã giảm giá:</h3>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <span class="coupon-badge" data-code="BEA50" style="border: 1px dashed #008848; color: #008848; background: #f0fdf4; padding: 6px 12px; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 600;">BEA50</span>
              <span class="coupon-badge" data-code="FREESHIP" style="border: 1px dashed #008848; color: #008848; background: #f0fdf4; padding: 6px 12px; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 600;">FREESHIP</span>
              <span class="coupon-badge" data-code="SALE20" style="border: 1px dashed #008848; color: #008848; background: #f0fdf4; padding: 6px 12px; border-radius: 4px; font-size: 13px; cursor: pointer; font-weight: 600;">SALE20</span>
            </div>
        </div>
    </div>`;

  // --- KÍCH HOẠT LỊCH (FLATPICKR) ---
  // Kiểm tra xem thư viện đã load chưa để tránh lỗi
  if (typeof flatpickr !== "undefined") {
    flatpickr("#datePicker", {
      locale: "vn",
      dateFormat: "d/m/Y",
      minDate: "today",
      disableMobile: "true",
      allowInput: true
    });
  } else {
    console.warn("Chưa import thư viện Flatpickr trong file HTML!");
  }
}

// Helper cho giỏ hàng (Global function để gọi từ onclick HTML string)
window.updateCartItem = function (id, newQty) {
  console.log('[trangchu] updateCartItem called', { id, newQty });
  let cart = getCart();
  if (newQty <= 0) {
    console.log('[trangchu] newQty <=0, calling removeCartItem', id);
    return removeCartItem(id);
  }
  const item = cart.find(i => i.id === id || String(i.id) === String(id));
  console.log('[trangchu] found item before update', item, 'cart', cart);
  if (item) item.qty = newQty;
  saveCart(cart);
  console.log('[trangchu] cart after update', getCart());
  renderCartPage();
};

window.removeCartItem = function (id) {
  if (!confirm("Xóa sản phẩm này?")) return;
  let cart = getCart();
  cart = cart.filter(i => i.id !== id);
  saveCart(cart);
  renderCartPage();
};


// ================= 5. QUICK VIEW & UTILS KHÁC =================
function viewQuick(productId) {
  fetch(`${API_BASE}/products/${productId}`)
    .then(res => res.json())
    .then(product => {
      const img = getProductImage(product);
      document.getElementById("qvTitle").textContent = product.productName;
      document.getElementById("qvPrice").textContent = formatCurrency(product.salePrice || product.price);
      document.getElementById("qvImg").src = img;
      document.getElementById("qvDesc").innerHTML = product.description || "Chưa có mô tả.";

      // Gán sự kiện cho nút thêm vào giỏ trong modal
      const qvBtn = document.querySelector(".qv-modal .btn-add-cart") || document.createElement("button"); // Fallback nếu HTML chưa có nút
      // Logic xử lý nút mua trong modal...

      document.getElementById("qvOverlay").style.display = "flex";
    })
    .catch(err => alert("Lỗi tải chi tiết!"));
}

// Đóng modal
document.getElementById("qvClose")?.addEventListener("click", () => {
  document.getElementById("qvOverlay").style.display = "none";
});
document.getElementById("qvOverlay")?.addEventListener("click", (e) => {
  if (e.target === document.getElementById("qvOverlay")) {
    document.getElementById("qvOverlay").style.display = "none";
  }
});

// Scroll Top
window.addEventListener("scroll", () => {
  const btn = document.querySelector(".scroll-top");
  if (btn) btn.style.display = window.scrollY > 300 ? "flex" : "none";
});
document.querySelector(".scroll-top")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ================= 6. KHỞI CHẠY =================
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge(); // Cập nhật số lượng giỏ hàng ngay khi load
  initHomePageData(); // Load dữ liệu API
  setupSearchFunctionality(); // Thiết lập chức năng tìm kiếm
});

// ================= LOGIC MỤC BÁN CHẠY (TABS + SCROLL) =================

// 1. Hàm load dữ liệu khi bấm Tab (Rau củ/Trái cây...)
async function loadBestSellers(slug) {
  const containerId = "bestseller-container";
  const container = document.getElementById(containerId);

  // Hiệu ứng loading
  if (container) {
    container.innerHTML = '<p style="padding:20px; width:100%; text-align:center; color:#888">Đang tải dữ liệu...</p>';
  }

  // Gọi API: Lọc theo category slug và sắp xếp mới nhất (hoặc bán chạy)
  // Lưu ý: Dùng sort=id,desc hoặc sort=productId,desc để tránh lỗi backend
  const endpoint = `/products?category=${slug}&sort=productId,desc&size=8`;

  await fetchProducts(endpoint, containerId);
}

// 2. Hàm cài đặt sự kiện click cho các Tab
function setupBestSellerTabs() {
  const buttons = document.querySelectorAll("#bestseller-tabs button");

  buttons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      // Bỏ class active ở nút cũ
      buttons.forEach(b => b.classList.remove("active"));

      // Thêm class active cho nút mới bấm
      e.target.classList.add("active");

      const slug = e.target.dataset.slug;
      loadBestSellers(slug);
    });
  });
}

function scrollBestSeller(direction) {
  const container = document.getElementById("bestseller-container");
  if (container) {
    const scrollAmount = 300;
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
}


async function loadFarmProducts(slug) {
  const containerId = "meat-container";
  const container = document.getElementById(containerId);

  if (container) {
    container.innerHTML = '<p style="padding:20px; width:100%; text-align:center; color:#888">Đang tải dữ liệu...</p>';
  }


  const endpoint = `/products?category=${slug}&size=8`;

  await fetchProducts(endpoint, containerId);
}

function setupFarmTabs() {
  const buttons = document.querySelectorAll("#farm-tabs button");

  buttons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      buttons.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");

      const slug = e.target.dataset.slug;
      console.log("Load Farm Category:", slug);

      loadFarmProducts(slug);
    });
  });
}


async function loadSeafoodProducts(keyword) {
  const containerId = "seafood-container";
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '<p style="padding:20px; text-align:center;">Đang tải...</p>';

  let endpoint = "";

  if (keyword === "hai-san") {
    endpoint = `/products?category=hai-san&size=6`;
  } else {

    endpoint = `/products?keyword=${keyword}&size=6`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error("Lỗi tải hải sản");
    const data = await res.json();
    const products = data.content ? data.content : data;
    renderProductsToContainer(containerId, products);
  } catch (err) {
    console.error(err);
    if (container) container.innerHTML = '<p style="text-align:center">Không tìm thấy sản phẩm</p>';
  }
}

function setupSeafoodTabs() {
  const buttons = document.querySelectorAll("#seafood-tabs button");
  buttons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      buttons.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");

      const slug = e.target.dataset.slug;
      loadSeafoodProducts(slug);
    });
  });
}

function goToProductDetail(id) {
  window.location.href = `/Frontend/ChiTietSanPham/product-detail.html?id=${id}`;
}

// ================= CHỨ̉C NĂNG TÌM KIẾM Ở TRANG CHỦ =================
let searchInitialized = false; // Flag để tránh gắn event nhiều lần

function setupSearchFunctionality() {
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');

  if (!searchInput || !searchButton) {
    console.warn('Không tìm thấy search input/button');
    return;
  }

  // Nếu đã khởi tạo rồi thì không làm gì
  if (searchInitialized) {
    console.log('Search đã được khởi tạo trước đó');
    return;
  }

  // Hàm thực hiện tìm kiếm
  const performSearch = () => {
    const keyword = searchInput.value.trim();
    if (!keyword) {
      alert('Vui lòng nhập từ khóa tìm kiếm!');
      return;
    }

    console.log('Tìm kiếm với từ khóa:', keyword);

    // Lưu từ khóa vào localStorage
    localStorage.setItem('searchKeyword', keyword);
    
    // Chuyển đến trang sản phẩm
    const productLink = document.querySelector('[data-page="product-page"]');
    if (productLink) {
      productLink.click();
    } else {
      // Fallback nếu đang ở chế độ standalone
      window.location.href = '/Frontend/SanPham/sanpham.html?search=' + encodeURIComponent(keyword);
    }
  };

  // Bắt sự kiện click nút tìm kiếm
  searchButton.addEventListener('click', performSearch);

  // Bắt sự kiện Enter trong ô input
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  searchInitialized = true;
  console.log('✅ Search functionality đã được khởi tạo');
}

// ================= HAMBURGER MENU (MOBILE NAV) =================
(function initHamburger() {
  const btn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');

  if (!btn || !navLinks || !overlay) return;

  function openNav() {
    navLinks.classList.add('open');
    overlay.classList.add('active');
    btn.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    navLinks.classList.remove('open');
    overlay.classList.remove('active');
    btn.classList.remove('open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    navLinks.classList.contains('open') ? closeNav() : openNav();
  });

  overlay.addEventListener('click', closeNav);

  // Đóng menu khi click vào nav link
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeNav();
    });
  });

  // Đóng menu khi resize lên desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeNav();
  });
})();