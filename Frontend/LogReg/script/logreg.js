//Chỉnh mắt cho Login
(function () {
  const passInput = document.getElementById('login-password');
  const eyeWrap = document.querySelector('#togglePassLogin'); // dùng id mới

  if (!passInput || !eyeWrap) return;

  const eyeSVG = {
    show: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',

    hide: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off-icon lucide-eye-off"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>'
  };

  function togglePassword() {
    const isHidden = passInput.type === 'password';
    passInput.type = isHidden ? 'text' : 'password';
    eyeWrap.innerHTML = isHidden ? eyeSVG.hide : eyeSVG.show;
  }

  // Click & keyboard (Enter/Space) để accessibility tốt hơn
  eyeWrap.addEventListener('click', togglePassword);
  eyeWrap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePassword();
    }
  });
})();

//Chỉnh mắt cho Sign up
(function () {
  const passInput = document.getElementById('signup-password');
  const eyeWrap = document.querySelector('#togglePassSignup'); // dùng id mới

  if (!passInput || !eyeWrap) return;

  const eyeSVG = {
    show: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',

    hide: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off-icon lucide-eye-off"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>'
  };

  function togglePasswordSignUp() {
    const isHidden = passInput.type === 'password';
    passInput.type = isHidden ? 'text' : 'password';
    eyeWrap.innerHTML = isHidden ? eyeSVG.hide : eyeSVG.show;
  }

  // Click & keyboard (Enter/Space) để accessibility tốt hơn
  eyeWrap.addEventListener('click', togglePasswordSignUp);
  eyeWrap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePasswordSignUp();
    }
  });
})();

//Chỉnh mắt cho repassword signup
(function () {
  const passInput = document.getElementById('signup-repassword');
  const eyeWrap = document.querySelector('#toggleRepassSignup'); // dùng id mới

  if (!passInput || !eyeWrap) return;

  const eyeSVG = {
    show: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',

    hide: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off-icon lucide-eye-off"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>'
  };

  function toggleRepasswordSignUp() {
    const isHidden = passInput.type === 'password';
    passInput.type = isHidden ? 'text' : 'password';
    eyeWrap.innerHTML = isHidden ? eyeSVG.hide : eyeSVG.show;
  }

  // Click & keyboard (Enter/Space) để accessibility tốt hơn
  eyeWrap.addEventListener('click', toggleRepasswordSignUp);
  eyeWrap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleRepasswordSignUp();
    }
  });
})();

//chuyển qua lại 2 UI 
const loginContainer = document.querySelector(".form-container");
const signupContainer = document.querySelector(".regisContainer");
const loginFormEl = document.querySelector(".form-container .form-box");
const goSignup = document.getElementById("goSignup");
const goLogin = document.getElementById("goLogin");

// Khi bấm "Sign up" → ẩn form login, hiện form đăng ký
if (goSignup) {
  goSignup.addEventListener("click", (e) => {
    e.preventDefault();
    loginContainer.classList.add("hidden");
    signupContainer.classList.remove("hidden");
  });
}

// Khi bấm "Sign in" → ẩn form đăng ký, hiện form login
if (goLogin) {
  goLogin.addEventListener("click", (e) => {
    e.preventDefault();
    signupContainer.classList.add("hidden");
    loginContainer.classList.remove("hidden");
  });
}

// --- Kiểm tra "Mật khẩu không trùng khớp" cho form Sign up ---
const signupForm = document.querySelector('.regisContainer .form-box');
const signupPass = document.getElementById('signup-password');
const signupRepass = document.getElementById('signup-repassword');
const passwordErrorEl = document.getElementById('password-error');
const loginMessageEl = document.getElementById('login-message');
const signupMessageEl = document.getElementById('signup-message');

const API_BASE_URL = 'http://localhost:8081/api/auth';
const VERIFY_PAGE_URL = 'VerifyOtp.html';
const HOME_PAGE_URL = '../TrangChu/trangchu.html';

function validateMatch() {
  const ok = signupPass.value === signupRepass.value;
  // thông báo
  if (passwordErrorEl) passwordErrorEl.textContent = ok ? '' : 'Mật khẩu không trùng khớp';
  // viền đỏ ô nhập lại
  if (signupRepass) signupRepass.classList.toggle('input-error', !ok);
  return ok;
}

// validate theo thời gian thực
if (signupPass && signupRepass) {
  ['input', 'blur'].forEach(ev => {
    signupPass.addEventListener(ev, validateMatch);
    signupRepass.addEventListener(ev, validateMatch);
  });
}

// chặn submit nếu không khớp (không đụng icon mắt)
function showStatus(target, message, isError = false) {
  if (target) {
    target.textContent = message;
    target.style.color = isError ? '#d23c3c' : '#1f7a4d';
  } else if (message) {
    alert(message);
  }
}

function setButtonLoading(button, isLoading) {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.dataset.originalText || button.textContent;
    button.textContent = 'Đang xử lý...';
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

function redirectWithDelay(url, delay = 1000) {
  if (!url) return;
  setTimeout(() => {
    window.location.href = url;
  }, delay);
}

async function callAuthApi(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === 'string' ? data : data?.message;
    throw new Error(message || 'Yêu cầu thất bại');
  }

  return data;
}

if (loginFormEl) {
  loginFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = loginFormEl.querySelector('.form-btn--submit');
    showStatus(loginMessageEl, '');
    setButtonLoading(submitBtn, true);

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const payload = {
      email: emailInput ? emailInput.value.trim() : '',
      password: passwordInput ? passwordInput.value : ''
    };

    try {
      const data = await callAuthApi('/login', payload);
      if (data?.token) {
        localStorage.setItem('hlpttToken', data.token);
      }
      // Lưu thông tin user
      if (data?.email) {
        localStorage.setItem('hlpttUserEmail', data.email);
      }
      if (data?.fullName) {
        localStorage.setItem('hlpttUserName', data.fullName);
      }
      showStatus(loginMessageEl, 'Đăng nhập thành công! Đang chuyển trang...');
      redirectWithDelay(HOME_PAGE_URL, 800);
    } catch (err) {
      showStatus(loginMessageEl, err.message || 'Đăng nhập thất bại', true);
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateMatch()) {
      signupRepass && signupRepass.focus();
      return;
    }

    const submitBtn = signupForm.querySelector('.form-btn--submit');
    showStatus(signupMessageEl, '');
    setButtonLoading(submitBtn, true);

    const fullNameInput = document.getElementById('signup-fullname');
    const emailInput = document.getElementById('signup-email');
    const phoneInput = document.getElementById('signup-phone');
    const passwordInput = document.getElementById('signup-password');

    const payload = {
      fullName: fullNameInput ? fullNameInput.value.trim() : '',
      email: emailInput ? emailInput.value.trim() : '',
      phone: phoneInput ? phoneInput.value.trim() : '',
      password: passwordInput ? passwordInput.value : ''
    };

    const emailForVerify = payload.email;

    try {
      const result = await callAuthApi('/register', payload);
      const message = typeof result === 'string' && result.length
        ? result
        : 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.';
      showStatus(signupMessageEl, `${message} Đang chuyển đến trang xác thực...`);
      signupForm.reset();
      passwordErrorEl && (passwordErrorEl.textContent = '');
      signupRepass && signupRepass.classList.remove('input-error');
      if (emailForVerify) {
        redirectWithDelay(`${VERIFY_PAGE_URL}?email=${encodeURIComponent(emailForVerify)}`, 1200);
      } else {
        redirectWithDelay(VERIFY_PAGE_URL, 1200);
      }
    } catch (err) {
      showStatus(signupMessageEl, err.message || 'Đăng ký thất bại', true);
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}
