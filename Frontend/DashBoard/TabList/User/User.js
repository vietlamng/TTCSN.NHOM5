// 1. SỬA LỖI REDECLARE (Khai báo trùng biến)
if (typeof window.API_USER === 'undefined') {
    window.API_USER = `${API_BASE}/users`;
}

// Biến lưu trạng thái (Gán vào window để không bị mất)
if (typeof window.userState === 'undefined') {
    window.userState = [];
}

// === INIT ===
window.initUserPage = function() {
    console.log("User Module Loaded");
    loadUserList();
}

// === LOAD DATA ===
async function loadUserList() {
    const token = localStorage.getItem("hlpttAdminToken");
    const tbody = document.getElementById("userTableBody");
    if(tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">⏳ Đang tải...</td></tr>`;

    try {
        // Gọi API lấy danh sách
        const res = await fetch(`${window.API_USER}?sort=userId,desc`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Nếu lỗi 500, 403... thì ném lỗi ra catch
        if (!res.ok) {
            throw new Error(`Lỗi Server (${res.status})`);
        }

        const data = await res.json();
        
        // Lấy list user (hỗ trợ cả Page object lẫn List thường)
        const users = data.content ? data.content : data;
        
        // Lưu vào biến toàn cục
        window.userState = users;
        
        // Render
        renderUserTable(users);

    } catch (e) {
        console.error("Lỗi tải user:", e);
        if(tbody) tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center">❌ Lỗi kết nối: ${e.message}</td></tr>`;
    }
}

function renderUserTable(users) {
    const tbody = document.getElementById("userTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    // SỬA LỖI FOREACH: Kiểm tra xem users có phải mảng không
    if (!Array.isArray(users) || users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">Không có người dùng nào.</td></tr>`;
        return;
    }

    users.forEach(u => {
        // Check null role an toàn
        const roleName = u.role ? u.role.roleName : "User";
        const roleClass = (roleName === 'ADMIN' || roleName === 'ROLE_ADMIN') ? 'role-admin' : 'role-user';
        
        const statusHtml = u.isActive 
            ? `<span class="status-active">Hoạt động</span>` 
            : `<span class="status-locked">Đã khóa</span>`;

        const row = `
            <tr>
                <td>#${u.userId}</td>
                <td><strong>${u.fullName}</strong></td>
                <td>${u.email}</td>
                <td>${u.phone || '--'}</td>
                <td><span class="${roleClass}">${roleName}</span></td>
                <td>${statusHtml}</td>
                <td>
                    <button class="action-btn" style="background:#dbeafe; color:#1e40af" onclick="window.openEditUser(${u.userId})">✏️</button>
                    <button class="action-btn" style="background:#fee2e2; color:#991b1b" onclick="window.deleteUser(${u.userId})">🗑️</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// === MODAL LOGIC ===
window.openAddUserModal = function() {
    document.getElementById("userForm").reset();
    document.getElementById("userId").value = "";
    document.getElementById("userEmail").disabled = false;
    document.getElementById("userModalTitle").innerText = "Thêm người dùng mới";
    document.getElementById("userModal").classList.remove("hidden");
}

window.openEditUser = function(id) {
    const user = window.userState.find(u => u.userId === id);
    if(!user) return;

    document.getElementById("userId").value = user.userId;
    document.getElementById("userFullName").value = user.fullName;
    document.getElementById("userEmail").value = user.email;
    document.getElementById("userEmail").disabled = true; // Cấm sửa email
    document.getElementById("userPhone").value = user.phone || "";
    document.getElementById("userPassword").value = ""; 
    document.getElementById("userActive").checked = user.isActive;
    
    if(user.role) document.getElementById("userRole").value = user.role.roleId;

    document.getElementById("userModalTitle").innerText = `Cập nhật User #${id}`;
    document.getElementById("userModal").classList.remove("hidden");
}

window.closeUserModal = function() {
    document.getElementById("userModal").classList.add("hidden");
}

// === SAVE ===
window.saveUser = async function() {
    const token = localStorage.getItem("hlpttAdminToken");
    const id = document.getElementById("userId").value;
    
    const payload = {
        fullName: document.getElementById("userFullName").value,
        email: document.getElementById("userEmail").value,
        phone: document.getElementById("userPhone").value,
        roleId: parseInt(document.getElementById("userRole").value),
        isActive: document.getElementById("userActive").checked,
        password: document.getElementById("userPassword").value
    };

    const url = id ? `${window.API_USER}/${id}` : window.API_USER;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Lưu thành công!");
            window.closeUserModal();
            loadUserList();
        } else {
            const err = await res.json();
            alert("Lỗi: " + (err.message || "Không thể lưu"));
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi hệ thống!");
    }
}

// === DELETE ===
window.deleteUser = async function(id) {
    if(!confirm("Bạn có chắc muốn xóa User này?")) return;
    const token = localStorage.getItem("hlpttAdminToken");
    
    try {
        const res = await fetch(`${window.API_USER}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) {
            alert("Đã xóa!");
            loadUserList();
        } else {
            alert("Xóa thất bại!");
        }
    } catch (e) { console.error(e); }
}

// === SEARCH ===
window.searchUser = function() {
    const key = document.getElementById("userSearchInput").value.toLowerCase();
    const filtered = window.userState.filter(u => 
        (u.fullName && u.fullName.toLowerCase().includes(key)) || 
        (u.email && u.email.toLowerCase().includes(key))
    );
    renderUserTable(filtered);
}