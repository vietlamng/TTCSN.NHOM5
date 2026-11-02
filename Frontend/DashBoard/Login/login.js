const API_BASE = "http://localhost:8081/api";

document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    const msg = document.getElementById('errorMsg');
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    btn.textContent = "Đang xử lý...";
    btn.disabled = true;
    msg.textContent = "";

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            // Lưu token
            localStorage.setItem("hlpttAdminToken", data.token);
            localStorage.setItem("adminInfo", JSON.stringify({
                name: data.fullName || "Admin",
                role: data.role
            }));
            
            // >>> SỬA ĐƯỜNG DẪN TẠI ĐÂY <<<
            // Lùi ra 1 cấp để về DashBoard/index.html
            window.location.href = "../index.html"; 
        } else {
            msg.textContent = data.message || "Đăng nhập thất bại!";
        }
    } catch (err) {
        console.error(err);
        msg.textContent = "Lỗi kết nối Server!";
    } finally {
        btn.textContent = "Đăng nhập";
        btn.disabled = false;
    }
});