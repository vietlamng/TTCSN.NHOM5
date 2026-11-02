const API_BASE = "http://localhost:8081/api";

// 1. KHỞI TẠO DASHBOARD
document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("hlpttAdminToken");
    if (!token) {
        window.location.href = "Login/login.html";
        return;
    }

    await loadComponent("sidebar-container", "Components/Sidebar.html");
    await loadComponent("header-container", "Components/Header.html");

    const info = JSON.parse(localStorage.getItem("adminInfo") || "{}");
    const nameEl = document.getElementById("adminNameDisplay");
    if (nameEl) nameEl.textContent = `Xin chào, ${info.name || "Admin"}`;

    switchTab('dashboard');
});

async function loadComponent(id, url) {
    try {
        const res = await fetch(url);
        if (res.ok) document.getElementById(id).innerHTML = await res.text();
    } catch (e) { console.error(`Lỗi tải ${url}`, e); }
}

// 2. CHUYỂN TAB
async function switchTab(tabName) {
    const contentDiv = document.getElementById("page-content");

    const links = document.querySelectorAll('.menu-link');
    links.forEach(a => a.classList.remove('active'));
    const activeBtn = document.getElementById(`menu-${tabName}`);
    if (activeBtn) activeBtn.classList.add('active');

    if (tabName === 'dashboard') {
        contentDiv.innerHTML = `
            <h2>Tổng quan</h2>
            <div class="stat-grid">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #e8f5e9;">
                        <i class="fa-solid fa-cart-shopping" style="color: #008848;"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Đơn hàng mới</h3>
                        <p class="stat-number" style="color:#008848" id="newOrdersCount">0</p>
                        <small class="stat-change positive" id="newOrdersChange">Đang tải...</small>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #e3f2fd;">
                        <i class="fa-solid fa-coins" style="color: #1976d2;"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Doanh thu tháng</h3>
                        <p class="stat-number" style="color:#1976d2" id="monthRevenue">0₫</p>
                        <small class="stat-change positive" id="monthRevenueChange">Đang tải...</small>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #fff3e0;">
                        <i class="fa-solid fa-user-plus" style="color: #f57c00;"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Khách hàng mới</h3>
                        <p class="stat-number" style="color:#f57c00" id="newCustomersCount">0</p>
                        <small class="stat-change positive" id="newCustomersChange">Đang tải...</small>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #f3e5f5;">
                        <i class="fa-solid fa-fire-flame-curved" style="color: #7b1fa2;"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Sản phẩm bán chạy</h3>
                        <p class="stat-number" style="color:#7b1fa2" id="productsSold">0</p>
                        <small class="stat-change">Sản phẩm trong tuần</small>
                    </div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Doanh thu 12 tháng</h3>
                        <select id="revenueYear" class="year-select">
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>
                    <canvas id="revenueChart"></canvas>
                </div>
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Phân bổ sản phẩm theo danh mục</h3>
                    </div>
                    <canvas id="categoryChart"></canvas>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card chart-wide">
                    <div class="chart-header">
                        <h3>Đơn hàng 30 ngày gần đây</h3>
                    </div>
                    <canvas id="ordersChart"></canvas>
                </div>
            </div>
            
            <div class="charts-grid">
                <div class="chart-card chart-wide">
                    <div class="chart-header">
                        <h3>Top 5 sản phẩm bán chạy (30 ngày qua)</h3>
                    </div>
                    <div id="topProductsContainer">
                        <p style="text-align:center; padding:20px; color:#666;">Đang tải...</p>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => { loadDashboardData(); }, 100);
    }
    else if (tabName === 'products') {
        await loadModule('TabList/Product/Product', 'initProductPage');
    }
    else if (tabName === 'coupons') {
        await loadModule('TabList/Coupon/Coupon', 'initCouponPage');
    }
    else if (tabName === 'orders') {
        await loadModule('TabList/Order/Order', 'initOrderPage');
    }
    else if (tabName === 'categories') {
        await loadModule('TabList/Category/Category', 'initCategoryPage');
    }
    else if (tabName === 'users') {
        await loadModule('TabList/User/User', 'initUserPage');
    }
    else if (tabName === 'brands') {
        contentDiv.innerHTML = `<h2>Quản lý Thương hiệu</h2><p>Chức năng đang phát triển...</p>`;
    }
    else if (tabName === 'reviews') {
        contentDiv.innerHTML = `<h2>Quản lý Đánh giá</h2><p>Chức năng đang phát triển...</p>`;
    }
    else if (tabName === 'settings') {
        contentDiv.innerHTML = `<h2>Cài đặt hệ thống</h2><p>Cấu hình website, banner, thông tin liên hệ...</p>`;
    }
}

// 3. MODULE LOADER
async function loadModule(pathBase, initFunctionName) {
    const contentDiv = document.getElementById("page-content");
    contentDiv.innerHTML = '<div class="loading">Đang tải dữ liệu...</div>';

    try {
        const res = await fetch(`${pathBase}.html`);
        if (!res.ok) throw new Error("Không tìm thấy file HTML");
        contentDiv.innerHTML = await res.text();

        const cssUrl = `${pathBase}.css`;
        if (!document.querySelector(`link[href="${cssUrl}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = cssUrl;
            document.head.appendChild(link);
        }

        const jsUrl = `${pathBase}.js`;
        const oldScript = document.querySelector(`script[src="${jsUrl}"]`);
        if (oldScript) oldScript.remove();

        const script = document.createElement("script");
        script.src = jsUrl;
        script.onload = () => {
            if (typeof window[initFunctionName] === "function") {
                window[initFunctionName]();
            }
        };
        document.body.appendChild(script);

    } catch (err) {
        console.error(err);
        contentDiv.innerHTML = `<p style="color:red; text-align:center; margin-top:20px;">
            Lỗi tải module: <b>${pathBase}</b><br>
            <small>Vui lòng kiểm tra lại tên file hoặc đường dẫn.</small>
        </p>`;
    }
}

// 4. TẢI DỮ LIỆU THỐNG KÊ
async function loadDashboardData() {
    const token = localStorage.getItem("hlpttAdminToken");
    if (!token) { window.location.href = "Login/login.html"; return; }

    try {
        const statsResponse = await fetch(`${API_BASE}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        if (!statsResponse.ok) {
            if (statsResponse.status === 401 || statsResponse.status === 403) {
                localStorage.removeItem("hlpttAdminToken");
                window.location.href = "Login/login.html";
                return;
            }
            throw new Error(`HTTP ${statsResponse.status}`);
        }

        const stats = await statsResponse.json();
        updateDashboardStats(stats);
        await loadChartData(token);
        await loadTopProducts(token);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showErrorMessage('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
    }
}

// 5. CẬP NHẬT THỐNG KÊ
function updateDashboardStats(stats) {
    if (stats.newOrders) {
        const countEl = document.getElementById('newOrdersCount');
        const changeEl = document.getElementById('newOrdersChange');
        if (countEl) countEl.textContent = stats.newOrders.count || 0;
        if (changeEl && stats.newOrders.change !== undefined) {
            const change = stats.newOrders.change;
            const arrow = change >= 0 ? '↑' : '↓';
            changeEl.textContent = `${arrow} ${Math.abs(change).toFixed(1)}% so với tuần trước`;
            changeEl.className = change >= 0 ? 'stat-change positive' : 'stat-change negative';
        }
    }

    if (stats.monthRevenue) {
        const amountEl = document.getElementById('monthRevenue');
        const changeEl = document.getElementById('monthRevenueChange');
        if (amountEl && stats.monthRevenue.amount !== undefined) {
            amountEl.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.monthRevenue.amount);
        }
        if (changeEl && stats.monthRevenue.change !== undefined) {
            const change = stats.monthRevenue.change;
            const arrow = change >= 0 ? '↑' : '↓';
            changeEl.textContent = `${arrow} ${Math.abs(change).toFixed(1)}% so với tháng trước`;
            changeEl.className = change >= 0 ? 'stat-change positive' : 'stat-change negative';
        }
    }

    if (stats.newCustomers) {
        const countEl = document.getElementById('newCustomersCount');
        const changeEl = document.getElementById('newCustomersChange');
        if (countEl) countEl.textContent = stats.newCustomers.count || 0;
        if (changeEl && stats.newCustomers.change !== undefined) {
            const change = stats.newCustomers.change;
            const arrow = change >= 0 ? '↑' : '↓';
            changeEl.textContent = `${arrow} ${Math.abs(change).toFixed(1)}% so với tuần trước`;
            changeEl.className = change >= 0 ? 'stat-change positive' : 'stat-change negative';
        }
    }

    if (stats.productsSold) {
        const countEl = document.getElementById('productsSold');
        if (countEl) countEl.textContent = stats.productsSold.count || 0;
    }
}

// 6. TẢI DỮ LIỆU BIỂU ĐỒ
async function loadChartData(token) {
    try {
        const currentYear = new Date().getFullYear();
        const [revenueRes, categoryRes, ordersRes] = await Promise.all([
            fetch(`${API_BASE}/dashboard/revenue-by-month?year=${currentYear}`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE}/dashboard/products-by-category`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE}/dashboard/orders-last-30-days`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!revenueRes.ok || !categoryRes.ok || !ordersRes.ok) throw new Error('Failed to fetch chart data');

        const revenueData = await revenueRes.json();
        const categoryData = await categoryRes.json();
        const ordersData = await ordersRes.json();
        initDashboardCharts(revenueData, categoryData, ordersData);

    } catch (error) {
        console.error('Error loading chart data:', error);
    }
}

// 7. KHỞI TẠO BIỂU ĐỒ
function initDashboardCharts(revenueApiData, categoryApiData, ordersApiData) {
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: revenueApiData.labels || [],
                datasets: [{ label: 'Doanh thu (triệu đồng)', data: revenueApiData.data || [], backgroundColor: 'rgba(0, 136, 72, 0.7)', borderColor: '#008848', borderWidth: 2, borderRadius: 8 }]
            },
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { display: true, position: 'top', labels: { font: { size: 13, family: "'Segoe UI', sans-serif" }, padding: 15 } },
                    tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, titleFont: { size: 14 }, bodyFont: { size: 13 }, callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y + ' triệu đồng' } }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 12 } } },
                    x: { grid: { display: false }, ticks: { font: { size: 12 } } }
                }
            }
        });
    }

    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: categoryApiData.labels || [],
                datasets: [{ data: categoryApiData.data || [], backgroundColor: ['#008848','#1976d2','#f57c00','#7b1fa2','#c62828','#616161','#00acc1','#5e35b1'], borderWidth: 2, borderColor: '#fff' }]
            },
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right', labels: {
                            font: { size: 13, family: "'Segoe UI', sans-serif" }, padding: 15,
                            generateLabels: chart => chart.data.labels.map((label, i) => ({ text: `${label}: ${chart.data.datasets[0].data[i]} sản phẩm`, fillStyle: chart.data.datasets[0].backgroundColor[i], hidden: false, index: i }))
                        }
                    },
                    tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, callbacks: { label: ctx => ctx.label + ': ' + ctx.parsed + ' sản phẩm' } }
                }
            }
        });
    }

    const ordersCtx = document.getElementById('ordersChart');
    if (ordersCtx) {
        new Chart(ordersCtx, {
            type: 'line',
            data: {
                labels: ordersApiData.labels || [],
                datasets: [{ label: 'Số đơn hàng', data: ordersApiData.data || [], borderColor: '#1976d2', backgroundColor: 'rgba(25,118,210,0.1)', borderWidth: 3, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#1976d2', pointBorderColor: '#fff', pointBorderWidth: 2, pointHoverRadius: 7 }]
            },
            options: {
                responsive: true, maintainAspectRatio: true,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: true, position: 'top', labels: { font: { size: 13 }, padding: 15, usePointStyle: true, pointStyle: 'circle' } },
                    tooltip: { backgroundColor: 'rgba(0,0,0,0.85)', padding: 14, titleFont: { size: 14, weight: 'bold' }, bodyFont: { size: 13 }, borderColor: '#1976d2', borderWidth: 1, callbacks: { label: ctx => ' Số đơn: ' + ctx.parsed.y + ' đơn' } }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 12 }, callback: v => v + ' đơn' } },
                    x: { grid: { display: false }, ticks: { font: { size: 11 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 15 } }
                }
            }
        });
    }
}

// 8. THÔNG BÁO LỖI
function showErrorMessage(message) {
    const contentDiv = document.getElementById("page-content");
    if (contentDiv && !contentDiv.querySelector('.stat-grid')) {
        contentDiv.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <p style="color: #c62828; font-size: 16px;">${message}</p>
                <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #008848; color: white; border: none; border-radius: 4px; cursor: pointer;">Thử lại</button>
            </div>`;
    }
}

// 9. LOGOUT
function logoutAdmin() {
    if (confirm("Bạn chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem("hlpttAdminToken");
        localStorage.removeItem("adminInfo");
        window.location.href = "Login/login.html";
    }
}

// 10. TOP PRODUCTS
async function loadTopProducts(token) {
    const container = document.getElementById('topProductsContainer');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE}/dashboard/top-products?limit=5`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const products = await response.json();

        if (!products || products.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:40px; color:#999;"><p style="font-size:16px;">Chưa có dữ liệu bán hàng</p></div>`;
            return;
        }

        let tableHTML = `
            <table style="width:100%; border-collapse: collapse;">
                <thead>
                    <tr style="background:#f9fafb; text-align:left;">
                        <th style="padding:12px; border-bottom:2px solid #e5e7eb; width:60px; text-align:center;">Hạng</th>
                        <th style="padding:12px; border-bottom:2px solid #e5e7eb;">Sản phẩm</th>
                        <th style="padding:12px; border-bottom:2px solid #e5e7eb; text-align:center;">Đã bán</th>
                        <th style="padding:12px; border-bottom:2px solid #e5e7eb; text-align:right;">Doanh thu</th>
                    </tr>
                </thead>
                <tbody>`;

        products.forEach((product, index) => {
            const bgColor = index % 2 === 0 ? '#ffffff' : '#fafafa';
            const rankDisplay = index < 3 ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${['#fff8e1','#f5f5f5','#fbe9e7'][index]};color:${['#f9a825','#757575','#bf360c'][index]};font-weight:700;font-size:13px;">${index+1}</span>` : `<span style="color:#999;font-weight:600;">${index+1}</span>`;

            tableHTML += `
                <tr style="background:${bgColor};">
                    <td style="padding:12px; border-bottom:1px solid #f0f0f0; text-align:center;">${rankDisplay}</td>
                    <td style="padding:12px; border-bottom:1px solid #f0f0f0;">
                        <div style="font-weight:600; color:#333;">${product.name}</div>
                        <small style="color:#999;">ID: #${product.id}</small>
                    </td>
                    <td style="padding:12px; border-bottom:1px solid #f0f0f0; text-align:center; color:#1976d2; font-weight:bold; font-size:16px;">${product.totalSold}</td>
                    <td style="padding:12px; border-bottom:1px solid #f0f0f0; text-align:right; color:#2e7d32; font-weight:600;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.revenue)}</td>
                </tr>`;
        });

        tableHTML += `</tbody></table>`;
        container.innerHTML = tableHTML;

    } catch (error) {
        console.error('Error loading top products:', error);
        container.innerHTML = `<p style="text-align:center; padding:20px; color:#c62828;">Không thể tải danh sách sản phẩm bán chạy</p>`;
    }
}
