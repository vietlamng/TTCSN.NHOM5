if (typeof window.categoryList === 'undefined') {
    window.categoryList = [];
}

const API_CAT = `${API_BASE}/categories`;

// === INIT ===
window.initCategoryPage = function() {
    loadCategoryList();
}

// === LOAD DATA ===
async function loadCategoryList() {
    const token = localStorage.getItem("hlpttAdminToken");
    const tbody = document.getElementById("categoryTableBody");
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">⏳ Đang tải...</td></tr>`;

    try {
        // Gọi API lấy danh sách (sort theo thứ tự hiển thị)
        const res = await fetch(`${API_CAT}?sort=displayOrder,asc`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const cats = data.content || data;
        
        window.categoryList = cats;
        renderCategoryTable(cats);

    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center">Lỗi kết nối!</td></tr>`;
    }
}

function renderCategoryTable(list) {
    const tbody = document.getElementById("categoryTableBody");
    tbody.innerHTML = "";

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">Chưa có danh mục nào.</td></tr>`;
        return;
    }

    list.forEach(c => {
        const imgUrl = c.image || "https://via.placeholder.com/50?text=Cat";
        const statusHtml = c.isActive 
            ? `<span class="badge-show">Hiển thị</span>` 
            : `<span class="badge-hide">Ẩn</span>`;

        const row = `
            <tr>
                <td>#${c.categoryId}</td>
                <td><img src="${imgUrl}" class="cat-img"></td>
                <td><strong>${c.categoryName}</strong></td>
                <td>${c.slug}</td>
                <td>${c.displayOrder}</td>
                <td>${statusHtml}</td>
                <td>
                    <button class="action-btn" style="background:#dbeafe; color:#1e40af" onclick="window.openEditCategory(${c.categoryId})">✏️</button>
                    <button class="action-btn" style="background:#fee2e2; color:#991b1b" onclick="window.deleteCategory(${c.categoryId})">🗑️</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// === MODAL LOGIC ===
window.openAddCategoryModal = function() {
    document.getElementById("categoryForm").reset();
    document.getElementById("catId").value = "";
    document.getElementById("catImageInput").value = ""; // Reset file input
    document.getElementById("catModalTitle").innerText = "Thêm danh mục mới";
    document.getElementById("categoryModal").classList.remove("hidden");
}

window.openEditCategory = function(id) {
    const c = window.categoryList.find(x => x.categoryId === id);
    if(!c) return;

    document.getElementById("catId").value = c.categoryId;
    document.getElementById("catName").value = c.categoryName;
    document.getElementById("catSlug").value = c.slug;
    document.getElementById("catOrder").value = c.displayOrder;
    document.getElementById("catDesc").value = c.description || "";
    document.getElementById("catActive").checked = c.isActive;
    
    document.getElementById("catModalTitle").innerText = `Cập nhật: ${c.categoryName}`;
    document.getElementById("categoryModal").classList.remove("hidden");
}

window.closeCategoryModal = function() {
    document.getElementById("categoryModal").classList.add("hidden");
}

// === SAVE & UPLOAD ===
window.saveCategory = async function() {
    const token = localStorage.getItem("hlpttAdminToken");
    const id = document.getElementById("catId").value;
    const name = document.getElementById("catName").value;

    if(!name) { alert("Vui lòng nhập tên danh mục!"); return; }

    const payload = {
        categoryName: name,
        slug: document.getElementById("catSlug").value.trim() || null,
        description: document.getElementById("catDesc").value,
        displayOrder: parseInt(document.getElementById("catOrder").value) || 0,
        isActive: document.getElementById("catActive").checked
    };

    const url = id ? `${API_CAT}/${id}` : API_CAT;
    const method = id ? 'PUT' : 'POST';

    try {
        // 1. Lưu thông tin
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const savedCat = await res.json();
            
            // 2. Upload ảnh (nếu có chọn)
            const fileInput = document.getElementById("catImageInput");
            if (fileInput.files.length > 0) {
                await uploadCatImage(savedCat.categoryId, fileInput.files[0], token);
            }

            alert("Lưu thành công!");
            window.closeCategoryModal();
            loadCategoryList();
        } else {
            alert("Lỗi lưu dữ liệu!");
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi hệ thống!");
    }
}

async function uploadCatImage(id, file, token) {
    const formData = new FormData();
    formData.append("file", file);
    try {
        await fetch(`${API_CAT}/${id}/upload-image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
    } catch(e) { alert("Lỗi upload ảnh!"); }
}

// === DELETE ===
window.deleteCategory = async function(id) {
    if(!confirm("Xóa danh mục này? (Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng)")) return;
    const token = localStorage.getItem("hlpttAdminToken");
    try {
        const res = await fetch(`${API_CAT}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) {
            alert("Đã xóa!");
            loadCategoryList();
        } else {
            alert("Không thể xóa (Danh mục đang được sử dụng).");
        }
    } catch (e) { console.error(e); }
}

// === SEARCH ===
window.searchCategory = function() {
    const key = document.getElementById("catSearchInput").value.toLowerCase();
    const filtered = window.categoryList.filter(c => 
        c.categoryName.toLowerCase().includes(key)
    );
    renderCategoryTable(filtered);
}