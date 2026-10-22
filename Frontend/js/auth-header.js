/**
 * auth-header.js
 * Quản lý hiển thị thông tin user trên header:
 * - Nếu chưa login: hiện nút "Đăng nhập / Đăng ký"
 * - Nếu đã login: hiện avatar + tên + dropdown (Thông tin cá nhân, Đăng xuất)
 */

(function () {
  const LOGIN_PAGE_URL = "/Frontend/LogReg/LogRegUI.html";
  const PROFILE_PAGE_URL = "/Frontend/Profile/profile.html";
  const HOME_PAGE_URL = "/Frontend/TrangChu/trangchu.html";

  function getApiBase() {
    if (typeof window.API_BASE === "string") return window.API_BASE;
    return "http://localhost:8081/api";
  }

  async function fetchCurrentUserFromApi(token) {
    try {
      const res = await fetch(getApiBase() + "/auth/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      if (!res.ok) throw new Error("Không lấy được thông tin user");
      return await res.json();
    } catch (err) {
      console.warn("Lỗi lấy /auth/me:", err);
      return null;
    }
  }

  function clearAuthStorage() {
    localStorage.removeItem("hlpttToken");
    localStorage.removeItem("hlpttUserName");
    localStorage.removeItem("hlpttUserEmail");
  }

  function logout() {
    clearAuthStorage();
    alert("Đã đăng xuất thành công!");
    window.location.href = HOME_PAGE_URL;
  }

  function buildLoginButton(headerIcons) {
    if (!headerIcons) return;

    // Xóa menu cũ nếu có
    const oldMenu = headerIcons.querySelector(".user-menu-wrapper");
    if (oldMenu) oldMenu.remove();
    const oldLogin = headerIcons.querySelector(".user-login-link");
    if (oldLogin) oldLogin.remove();

    const btn = document.createElement("div");
    btn.className = "user-login-link";
    btn.innerHTML = '<span class="icon">👤</span><span>Đăng nhập / Đăng ký</span>';

    btn.addEventListener("click", () => {
      window.location.href = LOGIN_PAGE_URL;
    });

    headerIcons.appendChild(btn);
  }

  function buildUserMenu(headerIcons, user) {
    if (!headerIcons) return;

    // Xóa phần cũ nếu có
    const oldMenu = headerIcons.querySelector(".user-menu-wrapper");
    if (oldMenu) oldMenu.remove();
    const oldLogin = headerIcons.querySelector(".user-login-link");
    if (oldLogin) oldLogin.remove();

    const fullName = user.fullName || user.full_name || "Tài khoản";
    const email = user.email || "";
    const avatar = user.avatar || user.avatarUrl || "";

    const wrapper = document.createElement("div");
    wrapper.className = "icon-item user-menu-wrapper";

    const avatarWrap = document.createElement("div");
    avatarWrap.className = "user-avatar-small";

    if (avatar) {
      const img = document.createElement("img");
      img.src = avatar;
      img.alt = fullName;
      avatarWrap.appendChild(img);
    } else {
      // Lấy chữ cái đầu làm avatar
      const initial = fullName.trim().charAt(0).toUpperCase() || "U";
      avatarWrap.textContent = initial;
    }

    const nameSpan = document.createElement("span");
    nameSpan.className = "user-name";
    nameSpan.textContent = fullName;

    const dropdown = document.createElement("div");
    dropdown.className = "user-dropdown";
    dropdown.innerHTML = `
      <button type="button" class="dropdown-item" data-action="profile">
        Thông tin cá nhân
      </button>
      <button type="button" class="dropdown-item" data-action="logout">
        Đăng xuất
      </button>
    `;

    wrapper.appendChild(avatarWrap);
    wrapper.appendChild(nameSpan);
    wrapper.appendChild(dropdown);
    headerIcons.appendChild(wrapper);

    function toggleDropdown(e) {
      e.stopPropagation();
      dropdown.classList.toggle("open");
    }

    avatarWrap.addEventListener("click", toggleDropdown);
    nameSpan.addEventListener("click", toggleDropdown);

    dropdown.addEventListener("click", (e) => {
      const btn = e.target.closest(".dropdown-item");
      if (!btn) return;
      const action = btn.getAttribute("data-action");
      if (action === "logout") {
        logout();
      } else if (action === "profile") {
        window.location.href = PROFILE_PAGE_URL;
      }
    });

    // Click ra ngoài để đóng dropdown
    document.addEventListener("click", () => {
      dropdown.classList.remove("open");
    });
    wrapper.addEventListener("click", (e) => e.stopPropagation());
  }

  async function updateHeaderWithUserInfo() {
    const headerIcons = document.querySelector(".header-icons");
    if (!headerIcons) return;

    const token = localStorage.getItem("hlpttToken");
    const storedName = localStorage.getItem("hlpttUserName");
    const storedEmail = localStorage.getItem("hlpttUserEmail");

    if (!token) {
      buildLoginButton(headerIcons);
      return;
    }

    let user = {
      fullName: storedName,
      email: storedEmail,
    };

    const apiUser = await fetchCurrentUserFromApi(token);
    if (apiUser) {
      user.fullName = apiUser.fullName || apiUser.full_name || user.fullName;
      user.email = apiUser.email || user.email;
      user.phone = apiUser.phone;
      user.avatar = apiUser.avatar || apiUser.avatarUrl || user.avatar;
    }

    // Cập nhật lại localStorage nếu có dữ liệu mới
    if (user.fullName) localStorage.setItem("hlpttUserName", user.fullName);
    if (user.email) localStorage.setItem("hlpttUserEmail", user.email);

    buildUserMenu(headerIcons, user);
  }

  // Chạy khi DOM ready
  document.addEventListener("DOMContentLoaded", updateHeaderWithUserInfo);

  // Nếu tab khác thay đổi localStorage (login/logout) thì cập nhật
  window.addEventListener("storage", (e) => {
    if (
      e.key === "hlpttToken" ||
      e.key === "hlpttUserName" ||
      e.key === "hlpttUserEmail"
    ) {
      updateHeaderWithUserInfo();
    }
  });

  // Cho phép gọi logout từ nơi khác nếu cần
  window.hlpttLogout = logout;
})();
