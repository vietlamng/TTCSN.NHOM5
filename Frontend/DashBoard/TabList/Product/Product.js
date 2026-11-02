// === BIẾN TOÀN CỤC ===
if (typeof window.productState === 'undefined') {
    window.productState = {
        products: [],
        categories: [],
        selectedIds: new Set()
    };
}

const API_PRODUCT = `${API_BASE}/products`;

// === 1. KHỞI TẠO ===
window.initProductPage = function() {
    loadCategories();
    loadProductData();
}

// === 2. TẢI DỮ LIỆU ===
async function loadProductData() {
    const token = localStorage.getItem("hlpttAdminToken");
    const tbody = document.getElementById("productTableBody");
    if(tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center">⏳ Đang tải...</td></tr>`;

    try {
        // Tăng size lên 200 để load nhiều sản phẩm hơn (hoặc dùng size=1000)
        const res = await fetch(`${API_PRODUCT}?sort=productId,desc&size=200`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(!res.ok) throw new Error("Lỗi tải data");
        
        const data = await res.json();
        window.productState.products = data.content || data;
        console.log(`✅ Đã load ${window.productState.products.length} sản phẩm`);
        renderProductTable(window.productState.products);
    } catch (err) {
        console.error(err);
        if(tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:red">❌ Lỗi tải dữ liệu</td></tr>`;
    }
}

// === 3. RENDER BẢNG ===
function renderProductTable(list) {
    const tbody = document.getElementById("productTableBody");
    if(!tbody) return;
    tbody.innerHTML = "";

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center">Trống</td></tr>`;
        return;
    }

    list.forEach((p, index) => {
        // Lấy ảnh đầu tiên
        let imgUrl = "https://via.placeholder.com/50?text=No+Img";
        if(p.productImages && p.productImages.length > 0) {
            imgUrl = p.productImages[0].imageUrl;
        }

        const isChecked = window.productState.selectedIds.has(p.productId);
        const row = `
            <tr>
                <td>
                    <input type="checkbox" class="product-checkbox" 
                           data-id="${p.productId}" 
                           ${isChecked ? 'checked' : ''}
                           onchange="window.toggleProductSelect(${p.productId}, this.checked)">
                </td>
                <td>${p.productId}</td>
                <td><img src="${imgUrl}" class="prod-img-thumb"></td>
                <td><b>${p.productName}</b></td>
                <td>${p.category ? p.category.categoryName : '--'}</td>
                <td style="color:#d0021b; font-weight:bold;">${new Intl.NumberFormat('vi-VN').format(p.price)}</td>
                <td>${p.stockQuantity}</td>
                <td>
                    <button class="action-btn btn-edit" onclick="window.openEditModal(${p.productId})">✏️</button>
                    <button class="action-btn btn-delete" onclick="window.deleteProduct(${p.productId})">🗑️</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    updateSelectionUI();
}

// === 4. LOGIC MODAL & KHO ===

// MỞ FORM THÊM MỚI
window.openAddProductModal = function() {
    document.getElementById("productForm").reset();
    document.getElementById("prodId").value = "";
    
    // Logic Kho: Thêm mới thì Tồn kho = 0
    document.getElementById("currentStock").value = 0;
    document.getElementById("addStock").value = 0;
    
    document.getElementById("modalTitle").innerText = "Thêm sản phẩm mới";
    document.getElementById("productModal").classList.remove("hidden");
}

// MỞ FORM SỬA
window.openEditModal = function(id) {
    const p = window.productState.products.find(x => x.productId === id);
    if (!p) return;

    document.getElementById("prodId").value = p.productId;
    document.getElementById("prodName").value = p.productName;
    document.getElementById("prodPrice").value = p.price;
    document.getElementById("prodDesc").value = p.description || "";
    if(p.category) document.getElementById("prodCategory").value = p.category.categoryId;

    // Logic Kho: Hiển thị tồn kho cũ, reset ô nhập thêm
    document.getElementById("currentStock").value = p.stockQuantity;
    document.getElementById("addStock").value = 0; // Reset ô nhập thêm về 0

    document.getElementById("modalTitle").innerText = `Cập nhật sản phẩm #${id}`;
    document.getElementById("productModal").classList.remove("hidden");
}

// === 5. LƯU SẢN PHẨM & UPLOAD ẢNH ===
window.saveProduct = async function() {
    const token = localStorage.getItem("hlpttAdminToken");
    
    // Lấy dữ liệu
    const id = document.getElementById("prodId").value;
    const name = document.getElementById("prodName").value;
    const price = document.getElementById("prodPrice").value;
    const catId = document.getElementById("prodCategory").value;
    
    // TÍNH TỔNG KHO = (Cũ + Mới)
    const currentStock = parseInt(document.getElementById("currentStock").value) || 0;
    const addStock = parseInt(document.getElementById("addStock").value) || 0;
    const finalStock = id ? (currentStock + addStock) : addStock; // Nếu sửa thì cộng dồn, thêm mới thì lấy số nhập

    if (!name || !price || !catId) {
        alert("Thiếu thông tin bắt buộc!");
        return;
    }

    const payload = {
        productName: name,
        price: parseFloat(price),
        stockQuantity: finalStock, // Gửi số tổng lên
        categoryId: parseInt(catId),
        description: document.getElementById("prodDesc").value,
        slug: name.toLowerCase().replace(/ /g, '-') + '-' + Date.now(),
        sku: "SKU-" + Date.now()
    };

    const url = id ? `${API_PRODUCT}/${id}` : API_PRODUCT;
    const method = id ? 'PUT' : 'POST';

    try {
        // BƯỚC 1: LƯU THÔNG TIN SẢN PHẨM
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(await res.text());
        
        const savedProduct = await res.json();
        const productId = savedProduct.productId; // Lấy ID vừa lưu

        // BƯỚC 2: UPLOAD ẢNH (NẾU CÓ CHỌN FILE)
        const fileInput = document.getElementById("prodImageInput");
        if (fileInput.files.length > 0) {
            await uploadProductImage(productId, fileInput.files[0], token);
        }

        alert("Lưu thành công!");
        window.closeProductModal();
        loadProductData();

    } catch (error) {
        console.error(error);
        alert(`Lỗi: ${error.message}`);
    }
}

// Hàm Upload ảnh riêng
async function uploadProductImage(id, file, token) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch(`${API_PRODUCT}/${id}/upload-image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }, // Không set Content-Type khi dùng FormData
            body: formData
        });
        if(!res.ok) throw new Error("Lỗi upload ảnh");
    } catch(e) {
        alert("Lưu sản phẩm OK nhưng upload ảnh thất bại!");
    }
}

// === 6. CÁC HÀM KHÁC ===
async function loadCategories() {
    try {
        const res = await fetch(`${API_BASE}/categories`);
        const data = await res.json();
        const cats = data.content || data;
        window.productState.categories = cats;
        
        const select = document.getElementById("prodCategory");
        if(select) {
            let html = '<option value="">-- Chọn danh mục --</option>';
            cats.forEach(c => html += `<option value="${c.categoryId}">${c.categoryName}</option>`);
            select.innerHTML = html;
        }
    } catch(e) {}
}

window.closeProductModal = function() {
    document.getElementById("productModal").classList.add("hidden");
}

window.deleteProduct = async function(id) {
    if(!confirm("Xóa sản phẩm này?")) return;
    const token = localStorage.getItem("hlpttAdminToken");
    await fetch(`${API_PRODUCT}/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` } 
    });
    loadProductData();
}

window.searchProduct = function() {
    const keyword = document.getElementById("productSearchInput").value.toLowerCase();
    const filtered = window.productState.products.filter(p => 
        p.productName.toLowerCase().includes(keyword)
    );
    renderProductTable(filtered);
}

// === CHỨC NĂNG CHỌN NHIỀU & XÓA HÀNG LOẠT ===

// Toggle chọn/bỏ chọn một sản phẩm
window.toggleProductSelect = function(productId, isChecked) {
    if (isChecked) {
        window.productState.selectedIds.add(productId);
    } else {
        window.productState.selectedIds.delete(productId);
    }
    updateSelectionUI();
}

// Toggle chọn/bỏ chọn tất cả
window.toggleSelectAll = function(checkbox) {
    const checkboxes = document.querySelectorAll('.product-checkbox');
    checkboxes.forEach(cb => {
        const productId = parseInt(cb.dataset.id);
        cb.checked = checkbox.checked;
        if (checkbox.checked) {
            window.productState.selectedIds.add(productId);
        } else {
            window.productState.selectedIds.delete(productId);
        }
    });
    updateSelectionUI();
}

// Cập nhật UI: hiện/ẩn nút xóa, đếm số lượng đã chọn
function updateSelectionUI() {
    const count = window.productState.selectedIds.size;
    const btnDelete = document.getElementById('btnDeleteSelected');
    const countSpan = document.getElementById('selectedCount');
    
    if (count > 0) {
        btnDelete.style.display = 'block';
        countSpan.textContent = count;
    } else {
        btnDelete.style.display = 'none';
    }
    
    // Cập nhật trạng thái checkbox "Chọn tất cả"
    const selectAllCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.product-checkbox');
    if (selectAllCheckbox && checkboxes.length > 0) {
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        selectAllCheckbox.checked = allChecked;
    }
}

// Xóa nhiều sản phẩm đã chọn
window.deleteSelectedProducts = async function() {
    const count = window.productState.selectedIds.size;
    if (count === 0) {
        alert('⚠️ Vui lòng chọn ít nhất một sản phẩm để xóa!');
        return;
    }
    
    if (!confirm(`⚠️ Bạn có chắc muốn xóa ${count} sản phẩm đã chọn?`)) {
        return;
    }
    
    const token = localStorage.getItem("hlpttAdminToken");
    const idsToDelete = Array.from(window.productState.selectedIds);
    
    let successCount = 0;
    let failCount = 0;
    
    // Xóa từng sản phẩm
    for (const id of idsToDelete) {
        try {
            const res = await fetch(`${API_PRODUCT}/${id}`, { 
                method: 'DELETE', 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            if (res.ok) {
                successCount++;
            } else {
                failCount++;
            }
        } catch (err) {
            console.error(`Lỗi xóa sản phẩm ${id}:`, err);
            failCount++;
        }
    }
    
    // Reset selection
    window.productState.selectedIds.clear();
    
    // Hiển thị kết quả
    if (failCount === 0) {
        alert(`✅ Đã xóa thành công ${successCount} sản phẩm!`);
    } else {
        alert(`⚠️ Xóa hoàn tất:\n✅ Thành công: ${successCount}\n❌ Thất bại: ${failCount}`);
    }
    
    // Reload dữ liệu
    loadProductData();
}