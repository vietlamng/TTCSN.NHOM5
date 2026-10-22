// Dữ liệu sản phẩm (tổng 60 sản phẩm)
const API_BASE_URL = "http://localhost:8081/api";
let products = [];
let searchKeyword = ""; // Thêm biến tìm kiếm

function getPlaceholderUrl(text, width = 300, height = 300) {
  const safeText = encodeURIComponent(text || "Sản phẩm");
  return `https://placehold.co/${width}x${height}?text=${safeText}`;
}

// Hàm chuẩn hóa text (bỏ dấu) để tìm kiếm không dấu
function normalizeText(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Bỏ dấu tiếng Việt
}

// Hàm xóa HTML tags từ text
function stripHtmlTags(html) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

async function fetchProductsFromBackend() {
  try {
    // Fetch a large number of products to support client-side filtering
    const response = await fetch(`${API_BASE_URL}/products?page=0&size=500&sort=productId,desc`);
    if (!response.ok) throw new Error("Failed to fetch products");
    const data = await response.json();

    console.log("✅ Đã load", data.content ? data.content.length : data.length, "sản phẩm"); // Debug log

    // Handle both paginated response (Page object) and raw array
    const productList = Array.isArray(data) ? data : (data.content || []);

    // Map backend data to frontend structure
    products = productList.map(p => {
      // Get image
      let img = getPlaceholderUrl(p.productName);
      if (p.productImages && p.productImages.length > 0) {
        const primary = p.productImages.find(i => i.isPrimary);
        img = primary ? primary.imageUrl : p.productImages[0].imageUrl;
      }

      return {
        id: p.productId,
        name: p.productName,
        price: new Intl.NumberFormat("vi-VN").format(p.salePrice || p.price), // Format as string for existing logic
        oldPrice: p.salePrice && p.salePrice < p.price ? new Intl.NumberFormat("vi-VN").format(p.price) : null,
        img: img,
        category: p.category ? p.category.slug : 'other', // Use slug for filtering
        discount: !!(p.salePrice && p.salePrice < p.price),
        description: stripHtmlTags(p.shortDescription || p.description || "")
      };
    });

    console.log("Mapped Products:", products); // Debug log

    // Re-render after fetching
    renderProducts();
  } catch (error) {
    console.error("Error loading products:", error);
    document.getElementById("productsGrid").innerHTML = '<div style="text-align:center; width:100%">Không thể tải sản phẩm. Vui lòng kiểm tra kết nối backend.</div>';
  }
}

let visibleCount = 8;
const productsGrid = document.getElementById("productsGrid");
const loadMoreBtn = document.getElementById("loadMore");
let lastSearchCount = 0; // Lưu số lượng sản phẩm tìm được

// Expose an initializer so the page can be loaded standalone or injected dynamically
window.initProductPage = async function (initialCategory) {
  try {
    // Reset visible count
    visibleCount = 8;

    // Fetch products once
    await fetchProductsFromBackend();

    // Kiểm tra xem có từ khóa tìm kiếm không (từ localStorage hoặc URL)
    const urlParams = new URLSearchParams(window.location.search);
    const searchFromUrl = urlParams.get('search');
    const categoryFromUrl = urlParams.get('category');
    const searchFromStorage = localStorage.getItem('searchKeyword');

    if (searchFromUrl || searchFromStorage) {
      searchKeyword = searchFromUrl || searchFromStorage;
      const searchInput = document.getElementById('productSearchInput');
      if (searchInput) {
        searchInput.value = searchKeyword;
      }
      // Xóa keyword khỏi localStorage sau khi đã sử dụng
      localStorage.removeItem('searchKeyword');
    }

    // Kiểm tra category từ URL hoặc parameter
    const categoryToApply = categoryFromUrl || initialCategory;

    if (categoryToApply) {
      // uncheck all
      document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(cb => cb.checked = false);
      // check only matching category boxes (if any)
      document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(cb => {
        if (cb.value === categoryToApply) cb.checked = true;
      });
    }

    // Render products and attach events
    renderProducts();
    attachAddToCartEvents();
    updateCartBadgeTrangSanPham();
    setupProductSearch();
    setupSortFunction();
  } catch (e) {
    console.error('initProductPage error', e);
  }
};

// If the script is loaded directly on the product page (standalone), auto-init
if (productsGrid && !window._sanphamInjected) {
  window.initProductPage();
}

function renderProducts() {
  if (!productsGrid) return;

  const checkedCats = Array.from(
    document.querySelectorAll('.filter-group input[type="checkbox"]:checked')
  ).map((cb) => cb.value);

  const priceFilterEl = document.querySelector('input[name="price"]:checked');
  const priceFilter = priceFilterEl ? priceFilterEl.value : '';

  productsGrid.innerHTML = "";

  // Nếu không chọn danh mục nào → hiện TẤT CẢ
  let filtered =
    checkedCats.length === 0
      ? products
      : products.filter((p) => checkedCats.includes(p.category));

  // Lọc theo giá
  filtered = filtered.filter((p) => {
    const price = parseInt(p.price.replace(/\./g, ""));
    if (priceFilter === "under20") return price < 20000;
    if (priceFilter === "20-50") return price >= 20000 && price <= 50000;
    if (priceFilter === "50-100") return price >= 50000 && price <= 100000;
    if (priceFilter === "over100") return price > 100000;
    return true;
  });

  // Lọc theo TỪ KHÓA (nếu có) - tìm kiếm CHÍNH XÁC có dấu
  if (searchKeyword) {
    const keyword = searchKeyword.trim().toLowerCase();

    filtered = filtered.filter((p) => {
      const productName = (p.name || '').toLowerCase();
      const productDesc = (p.description || '').toLowerCase();

      // Tách từ khóa thành các từ riêng lẻ
      const keywords = keyword.split(/\s+/).filter(k => k.length > 0);

      // Kiểm tra xem TẤT CẢ các từ khóa có xuất hiện trong tên hoặc mô tả không
      return keywords.every(kw => {
        // Tách tên sản phẩm thành các từ để so sánh chính xác
        const productWords = productName.split(/\s+/);
        const descWords = productDesc.split(/\s+/);

        // So sánh chính xác từng từ (GIỮ NGUYÊN DẤU)
        return productWords.some(word => word === kw || word.startsWith(kw)) ||
          descWords.some(word => word === kw || word.startsWith(kw));
      });
    });
  }

  // Lưu lại số lượng sản phẩm khớp để hiển thị thông báo
  lastSearchCount = filtered.length;

  const toShow = filtered.slice(0, visibleCount);

  // Hiển thị thông báo nếu đang tìm kiếm
  if (searchKeyword && filtered.length === 0) {
    productsGrid.innerHTML = `
      <div style="text-align:center; width:100%; padding:40px; color:#666;">
        <p style="font-size:18px; margin-bottom:10px;">😔 Không tìm thấy sản phẩm nào với từ khóa "<strong>${searchKeyword}</strong>"</p>
        <p>Vui lòng thử lại với từ khóa khác!</p>
        <button onclick="clearSearch()" style="margin-top:20px; padding:10px 20px; background:#008848; color:white; border:none; border-radius:5px; cursor:pointer;">Xóa tìm kiếm</button>
      </div>`;
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    return;
  }

  if (searchKeyword && filtered.length > 0) {
    const resultInfo = document.createElement('div');
    resultInfo.style.cssText = 'padding:10px 0; color:#008848; font-weight:600; margin-bottom:10px;';
    resultInfo.textContent = `✓ Tìm thấy ${filtered.length} sản phẩm với từ khóa "${searchKeyword}"`;
    productsGrid.appendChild(resultInfo);
  }

  toShow.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card show";
    card.setAttribute('data-product-id', p.id);
    const detailUrl = `/Frontend/ChiTietSanPham/product-detail.html?id=${p.id}`;
    card.innerHTML = `
          <div style="position:relative">
            ${p.discount
        ? `<span class="discount-badge">-${Math.floor(Math.random() * 20 + 10)}%</span>`
        : ""
      }
            <a href="${detailUrl}" style="display:block">
                <img src="${p.img}" alt="${p.name}" class="product-img" onerror="this.onerror=null;this.src='${getPlaceholderUrl(p.name)}'">
            </a>
          </div>
          
          <div class="product-info">
              <a href="${detailUrl}" class="product-name">${p.name}</a>
              <div>
                <span class="product-price current-price">${p.price}đ</span>
                ${p.oldPrice ? `<span class="product-old-price">${p.oldPrice}đ</span>` : ""}
              </div>
              <button class="btn-add">Thêm vào giỏ</button>
          </div>
        `;
    productsGrid.appendChild(card);
  });

  if (loadMoreBtn) {
    loadMoreBtn.style.display =
      visibleCount >= filtered.length ? "none" : "block";
  }
}

// ====== HÀM GIỎ HÀNG CHO TRANG SẢN PHẨM ======
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cartItems")) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("cartItems", JSON.stringify(cart));
}

function updateCartBadgeTrangSanPham() {
  // Hỗ trợ cả trang sản phẩm độc lập (#cartBadge) và nhúng trong trang chủ (#gioHang .badge)
  const cartBadge = document.querySelector("#cartBadge") || document.querySelector("#gioHang .badge");
  if (!cartBadge) return;
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartBadge.textContent = totalQty;
}

function attachAddToCartEvents() {
  if (!productsGrid) return;

  // tránh gắn trùng nhiều lần
  if (productsGrid._hasCartListener) return;
  productsGrid._hasCartListener = true;

  productsGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add");
    if (!btn) return;

    const card = btn.closest(".product-card");
    if (!card) return;

    const productId = parseInt(card.getAttribute('data-product-id'));
    const name =
      card.querySelector(".product-name")?.textContent?.trim() || "";
    const priceText =
      card.querySelector(".product-price")?.textContent || "";
    const img = card.querySelector(".product-img")?.src || "";

    const price = parseInt(priceText.replace(/[^\d]/g, "")) || 0;

    let cart = getCart();
    const found = cart.find((item) => item.id === productId);

    if (found) {
      found.qty += 1;
    } else {
      const prodId = card.dataset.productId ? parseInt(card.dataset.productId) : Date.now();
      cart.push({
        id: productId,
        name,
        price,
        img,
        qty: 1,
      });
    }

    saveCart(cart);
    updateCartBadgeTrangSanPham();

    alert(
      "Đã thêm vào giỏ hàng:\n\n" +
      name +
      "\nGiá: " +
      new Intl.NumberFormat("vi-VN").format(price) +
      "₫"
    );
  });

  // Bắt tạm nút So sánh để hiện thông báo (tuỳ chọn)
  productsGrid.addEventListener("click", (e) => {
    const compareBtn = e.target.closest(".qa-compare");
    if (compareBtn) {
      const card = compareBtn.closest(".product-card");
      const name =
        card.querySelector(".product-name")?.textContent?.trim() || "Sản phẩm";
      alert("🔍 Tính năng so sánh đang được phát triển cho: " + name);
    }
  });
}

// Load more
if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", () => {
    visibleCount += 8;
    renderProducts();
  });
}

// Lọc khi thay đổi
const _filterInputs = document.querySelectorAll(".filter-group input");
if (_filterInputs && _filterInputs.length) {
  _filterInputs.forEach((input) => {
    input.addEventListener("change", () => {
      // Khi chọn filter thì xóa từ khóa tìm kiếm
      searchKeyword = '';
      const searchInput = document.getElementById('productSearchInput');
      if (searchInput) searchInput.value = '';

      visibleCount = 8;
      renderProducts();
    });
  });
}

// Click vào icon danh mục trên header
const _catItems = document.querySelectorAll(".cat-item");
if (_catItems && _catItems.length) {
  _catItems.forEach((item) => {
    item.addEventListener("click", () => {
      const cat = item.dataset.cat;

      // Xóa từ khóa tìm kiếm khi chọn danh mục
      searchKeyword = '';
      const searchInput = document.getElementById('productSearchInput');
      if (searchInput) searchInput.value = '';

      document
        .querySelectorAll('.filter-group input[type="checkbox"]')
        .forEach((cb) => {
          cb.checked = cb.value === cat;
        });
      visibleCount = 8;
      renderProducts();
    });
  });
}


// ====== CHỨC NĂNG TÌM KIẾM TRONG TRANG SẢN PHẨM ======
function setupProductSearch() {
  const searchInput = document.getElementById('productSearchInput');
  const searchBtn = document.getElementById('productSearchBtn');

  if (!searchInput || !searchBtn) return;

  const performSearch = () => {
    searchKeyword = searchInput.value.trim();
    visibleCount = 8;
    renderProducts();

    // Scroll to top để xem kết quả
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
}

// Hàm xóa tìm kiếm (global để gọi từ HTML)
window.clearSearch = function () {
  searchKeyword = '';
  const searchInput = document.getElementById('productSearchInput');
  if (searchInput) searchInput.value = '';

  // Bỏ chọn tất cả filter để hiển thị tất cả sản phẩm
  document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="price"]').forEach(rb => {
    if (rb.value === 'all') rb.checked = true;
    else rb.checked = false;
  });

  visibleCount = 8;
  renderProducts();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ====== CHỨC NĂNG SẮP XẾP SẢN PHẨM ======
function setupSortFunction() {
  const sortSelect = document.getElementById('sortSelect');
  if (!sortSelect) return;

  sortSelect.addEventListener('change', (e) => {
    const sortValue = e.target.value;
    sortProducts(sortValue);
    visibleCount = 8;
    renderProducts();
  });
}

function sortProducts(sortType) {
  switch (sortType) {
    case 'price-asc':
      products.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/\./g, ''));
        const priceB = parseInt(b.price.replace(/\./g, ''));
        return priceA - priceB;
      });
      break;
    case 'price-desc':
      products.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/\./g, ''));
        const priceB = parseInt(b.price.replace(/\./g, ''));
        return priceB - priceA;
      });
      break;
    case 'name-asc':
      products.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      break;
    case 'name-desc':
      products.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
      break;
    default:
      // Mặc định: không sắp xếp hoặc sắp xếp theo ID
      products.sort((a, b) => a.id - b.id);
  }
}

// Khởi tạo (guarded)
if (productsGrid) {
  renderProducts();
  attachAddToCartEvents();
  updateCartBadgeTrangSanPham();
  setupProductSearch();
  setupSortFunction();
}

// ====== MOBILE FILTER BAR FUNCTIONS ======

// Mobile category dropdown → sync sidebar checkboxes → re-render
window.mobileCatFilter = function() {
  const sel = document.getElementById('mobileCatSelect');
  if (!sel) return;
  const val = sel.value;
  document.querySelectorAll('.sidebar .filter-group input[type="checkbox"]').forEach(cb => {
    cb.checked = val ? (cb.value === val) : false;
  });
  searchKeyword = '';
  visibleCount = 8;
  renderProducts();
};

// Mobile sort → call sortProducts + re-render
window.mobileSort = function(val) {
  sortProducts(val);
  visibleCount = 8;
  renderProducts();
};

// Price range slider → set max price and re-render
window._mobileMaxPrice = 500000;
window.updatePriceRange = function(val) {
  const v = parseInt(val);
  window._mobileMaxPrice = v;
  const el = document.getElementById('priceDisplay');
  if (el) el.textContent = new Intl.NumberFormat('vi-VN').format(v) + 'đ';

  // Set radio to 'all' so renderProducts doesn't double-filter
  document.querySelectorAll('.sidebar input[name="price"]').forEach(r => {
    r.checked = (r.value === 'all');
  });
  visibleCount = 8;
  renderProducts();
};

// Patch renderProducts to also apply mobile price range
(function() {
  const _origRender = renderProducts;
  renderProducts = function() {
    if (window.innerWidth <= 768 && window._mobileMaxPrice < 500000) {
      const maxP = window._mobileMaxPrice;
      const backup = [...products];
      products = products.filter(p => {
        const price = parseInt(p.price.replace(/\./g, ''));
        return price <= maxP;
      });
      _origRender();
      products = backup;
    } else {
      _origRender();
    }
  };
})();

// Hide desktop sidebar on mobile
if (window.innerWidth <= 768) {
  document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.productPage .sidebar');
    if (sidebar) sidebar.style.display = 'none';
  });
}
