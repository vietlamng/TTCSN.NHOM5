(function () {
  const LOGIN_PAGE_URL = "../LogReg/LogRegUI.html";

  function getApiBase() {
    if (typeof window.API_BASE === "string") return window.API_BASE;
    return "http://localhost:8081/api";
  }

  function getToken() {
    return localStorage.getItem("hlpttToken");
  }

  function fillProfileInfo(user) {
    const nameEls = document.querySelectorAll(".js-profile-name");
    const emailEl = document.querySelector(".js-profile-email");
    const phoneEl = document.querySelector(".js-profile-phone");
    const avatarImg = document.getElementById("profileAvatarImg");

    const fullName = user.fullName || user.full_name || "Khách hàng";
    const email = user.email || "Chưa có email";
    const phone = user.phone || "Chưa cập nhật";
    const avatar = user.avatar || user.avatarUrl;

    nameEls.forEach((el) => (el.textContent = fullName));
    if (emailEl) emailEl.textContent = email;
    if (phoneEl) phoneEl.textContent = phone;
    if (avatarImg && avatar) avatarImg.src = avatar;
  }

  async function loadProfile() {
    const token = getToken();
    if (!token) {
      window.location.href = LOGIN_PAGE_URL;
      return;
    }

    try {
      const res = await fetch(getApiBase() + "/auth/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!res.ok) {
        throw new Error("Không lấy được thông tin tài khoản");
      }

      const user = await res.json();
      window.currentUser = user;
      fillProfileInfo(user);
    } catch (err) {
      console.error(err);
      alert(err.message || "Không tải được thông tin tài khoản");
      window.location.href = LOGIN_PAGE_URL;
    }
  }

  function initEditForm() {
    const editBtn = document.getElementById("btnEditProfile");
    const form = document.getElementById("profileEditForm");
    const cancelBtn = document.getElementById("btnCancelEdit");
    const saveBtn = document.getElementById("btnSaveProfile");

    if (!editBtn || !form) return;

    editBtn.addEventListener("click", () => {
      const user = window.currentUser || {};
      const fullNameInput = document.getElementById("editFullName");
      const phoneInput = document.getElementById("editPhone");

      if (fullNameInput) fullNameInput.value = user.fullName || "";
      if (phoneInput) phoneInput.value = user.phone || "";

      form.classList.add("open");
      editBtn.classList.add("hidden");
    });

    if (cancelBtn) {
      cancelBtn.addEventListener("click", (e) => {
        e.preventDefault();
        form.classList.remove("open");
        editBtn.classList.remove("hidden");
      });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const token = getToken();
      if (!token) {
        window.location.href = LOGIN_PAGE_URL;
        return;
      }

      const fullNameInput = document.getElementById("editFullName");
      const phoneInput = document.getElementById("editPhone");
      const fullName = fullNameInput ? fullNameInput.value.trim() : "";
      const phone = phoneInput ? phoneInput.value.trim() : "";

      if (!fullName) {
        alert("Họ tên không được để trống");
        fullNameInput && fullNameInput.focus();
        return;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = "Đang lưu...";

      try {
        const res = await fetch(getApiBase() + "/user/update-profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ fullName, phone }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Cập nhật thông tin thất bại");
        }

        let updatedUser;
        try {
          updatedUser = await res.json();
        } catch {
          updatedUser = null;
        }

        if (!updatedUser) {
          updatedUser = Object.assign({}, window.currentUser || {}, {
            fullName,
            phone,
          });
        }

        window.currentUser = updatedUser;
        fillProfileInfo(updatedUser);
        form.classList.remove("open");
        editBtn.classList.remove("hidden");
        alert("Cập nhật thông tin thành công!");
      } catch (err) {
        console.error(err);
        alert(err.message || "Cập nhật thông tin thất bại");
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Lưu thay đổi";
      }
    });
  }

  function initAvatarUpload() {
    const fileInput = document.getElementById("avatarInput");
    const changeBtn = document.getElementById("btnChangeAvatar");
    const avatarImg = document.getElementById("profileAvatarImg");

    if (!fileInput || !changeBtn) return;

    changeBtn.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file ảnh hợp lệ");
        return;
      }

      const token = getToken();
      if (!token) {
        window.location.href = LOGIN_PAGE_URL;
        return;
      }

      changeBtn.disabled = true;
      const oldText = changeBtn.textContent;
      changeBtn.textContent = "Đang tải...";

      const formData = new FormData();
      formData.append("avatar", file);

      try {
        const res = await fetch(getApiBase() + "/user/update-avatar", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
          },
          body: formData,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Cập nhật ảnh đại diện thất bại");
        }

        let data = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }

        const avatarUrl = data.avatar || data.avatarUrl;
        if (avatarImg) {
          if (avatarUrl) {
            avatarImg.src = avatarUrl;
          } else {
            avatarImg.src = URL.createObjectURL(file);
          }
        }

        if (!window.currentUser) window.currentUser = {};
        window.currentUser.avatar = avatarImg ? avatarImg.src : avatarUrl;

        alert("Cập nhật ảnh đại diện thành công!");
      } catch (err) {
        console.error(err);
        alert(err.message || "Cập nhật ảnh đại diện thất bại");
      } finally {
        changeBtn.disabled = false;
        changeBtn.textContent = oldText;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initEditForm();
    initAvatarUpload();
    loadProfile();
  });
})();
