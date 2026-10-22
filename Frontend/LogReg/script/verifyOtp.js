const form = document.getElementById('verify-form');
const emailInput = document.getElementById('verify-email');
const otpInput = document.getElementById('verify-otp');
const messageEl = document.getElementById('verify-message');
const submitBtn = document.getElementById('verify-submit');

const API_BASE_URL = 'http://localhost:8081/api/auth';
const params = new URLSearchParams(window.location.search);
const emailFromQuery = params.get('email');
if (emailInput && emailFromQuery) {
  emailInput.value = emailFromQuery;
}

function updateStatus(message, isError = false) {
  if (!messageEl) return;
  messageEl.textContent = message;
  messageEl.style.color = isError ? '#d23c3c' : '#227a52';
}

function setLoading(isLoading) {
  if (!submitBtn) return;
  if (isLoading) {
    submitBtn.dataset.originalText = submitBtn.dataset.originalText || submitBtn.textContent;
    submitBtn.textContent = 'Đang xác thực...';
    submitBtn.disabled = true;
  } else {
    submitBtn.textContent = submitBtn.dataset.originalText || submitBtn.textContent;
    submitBtn.disabled = false;
  }
}

async function verifyOtp(payload) {
  const response = await fetch(`${API_BASE_URL}/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || 'Xác thực thất bại');
  }

  return text;
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = emailInput ? emailInput.value.trim() : '';
    const otp = otpInput ? otpInput.value.trim() : '';

    if (!email || !otp) {
      updateStatus('Vui lòng nhập đầy đủ email và OTP', true);
      return;
    }

    updateStatus('');
    setLoading(true);

    try {
      const result = await verifyOtp({ email, otp });
      updateStatus(result || 'Xác thực thành công!');
      form.reset();
    } catch (err) {
      updateStatus(err.message || 'Xác thực thất bại', true);
    } finally {
      setLoading(false);
    }
  });
}

