const API_BASE = 'http://localhost:8081/api';

// DOM Elements
const emailStep = document.getElementById('emailStep');
const resetStep = document.getElementById('resetStep');
const emailForm = document.getElementById('emailForm');
const resetForm = document.getElementById('resetForm');
const emailInput = document.getElementById('email');
const emailMessage = document.getElementById('email-message');
const resetCodeInput = document.getElementById('resetCode');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordMatchError = document.getElementById('password-match-error');
const resetMessage = document.getElementById('reset-message');
const sendCodeBtn = document.getElementById('sendCodeBtn');
const resetBtn = document.getElementById('resetBtn');
const resendCodeLink = document.getElementById('resendCode');
const countdownSpan = document.getElementById('countdown');

let userEmail = '';
let countdownTimer = null;
let countdownSeconds = 60;

// ==================== STEP 1: SEND RESET CODE ====================

emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    if (!email || !isValidEmail(email)) {
        showMessage(emailMessage, 'Vui lòng nhập email hợp lệ', 'error');
        return;
    }

    userEmail = email;

    // Disable button and show loading
    sendCodeBtn.disabled = true;
    sendCodeBtn.classList.add('loading');
    sendCodeBtn.textContent = 'Đang gửi...';

    try {
        const response = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(emailMessage, 'Mã xác thực đã được gửi đến email của bạn!', 'success');

            // Wait 1.5s then switch to step 2
            setTimeout(() => {
                emailStep.classList.add('hidden');
                resetStep.classList.remove('hidden');
                startCountdown();
            }, 1500);
        } else {
            showMessage(emailMessage, data.message || 'Email không tồn tại trong hệ thống', 'error');
            sendCodeBtn.disabled = false;
            sendCodeBtn.classList.remove('loading');
            sendCodeBtn.textContent = 'Gửi mã xác thực';
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage(emailMessage, 'Lỗi kết nối. Vui lòng thử lại sau.', 'error');
        sendCodeBtn.disabled = false;
        sendCodeBtn.classList.remove('loading');
        sendCodeBtn.textContent = 'Gửi mã xác thực';
    }
});

// ==================== STEP 2: RESET PASSWORD ====================

resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const resetCode = resetCodeInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Validation
    if (!resetCode || resetCode.length !== 6) {
        showMessage(resetMessage, 'Mã xác thực phải có 6 số', 'error');
        return;
    }

    if (!newPassword || newPassword.length < 6) {
        showMessage(resetMessage, 'Mật khẩu phải có ít nhất 6 ký tự', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        passwordMatchError.textContent = '⚠️ Mật khẩu xác nhận không khớp';
        return;
    } else {
        passwordMatchError.textContent = '';
    }

    // Disable button and show loading
    resetBtn.disabled = true;
    resetBtn.classList.add('loading');
    resetBtn.textContent = 'Đang xử lý...';

    try {
        const response = await fetch(`${API_BASE}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: userEmail,
                verificationCode: resetCode,
                newPassword: newPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(resetMessage, '✅ Đặt lại mật khẩu thành công!', 'success');

            // Clear countdown
            if (countdownTimer) {
                clearInterval(countdownTimer);
            }

            // Redirect to login after 2s
            setTimeout(() => {
                window.location.href = '../LogReg/LogRegUI.html';
            }, 2000);
        } else {
            showMessage(resetMessage, data.message || 'Mã xác thực không đúng hoặc đã hết hạn', 'error');
            resetBtn.disabled = false;
            resetBtn.classList.remove('loading');
            resetBtn.textContent = 'Đặt lại mật khẩu';
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage(resetMessage, 'Lỗi kết nối. Vui lòng thử lại sau.', 'error');
        resetBtn.disabled = false;
        resetBtn.classList.remove('loading');
        resetBtn.textContent = 'Đặt lại mật khẩu';
    }
});

// ==================== PASSWORD VISIBILITY TOGGLE ====================

document.getElementById('toggleNewPassword').addEventListener('click', function () {
    togglePasswordVisibility(newPasswordInput, this);
});

document.getElementById('toggleConfirmPassword').addEventListener('click', function () {
    togglePasswordVisibility(confirmPasswordInput, this);
});

function togglePasswordVisibility(input, icon) {
    if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-eye-off">
                <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
                <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
                <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
                <path d="m2 2 20 20"/>
            </svg>
        `;
    } else {
        input.type = 'password';
        icon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-eye">
                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
        `;
    }
}

// ==================== RESEND CODE ====================

resendCodeLink.addEventListener('click', async (e) => {
    e.preventDefault();

    if (resendCodeLink.classList.contains('disabled')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail })
        });

        if (response.ok) {
            showMessage(resetMessage, 'Đã gửi lại mã xác thực!', 'success');
            startCountdown();
        } else {
            showMessage(resetMessage, 'Không thể gửi lại mã. Vui lòng thử lại sau.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage(resetMessage, 'Lỗi kết nối.', 'error');
    }
});

// ==================== COUNTDOWN TIMER ====================

function startCountdown() {
    countdownSeconds = 60;
    resendCodeLink.classList.add('disabled');

    if (countdownTimer) {
        clearInterval(countdownTimer);
    }

    countdownTimer = setInterval(() => {
        countdownSeconds--;
        countdownSpan.textContent = countdownSeconds;

        if (countdownSeconds <= 0) {
            clearInterval(countdownTimer);
            resendCodeLink.classList.remove('disabled');
            countdownSpan.textContent = '0';
        }
    }, 1000);
}

// ==================== HELPER FUNCTIONS ====================

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `status-text ${type}`;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Password match validation in real-time
confirmPasswordInput.addEventListener('input', () => {
    if (confirmPasswordInput.value && newPasswordInput.value !== confirmPasswordInput.value) {
        passwordMatchError.textContent = '⚠️ Mật khẩu xác nhận không khớp';
    } else {
        passwordMatchError.textContent = '';
    }
});
