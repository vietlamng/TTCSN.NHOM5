// Hiệu ứng mở/đóng câu hỏi
const _questions = document.querySelectorAll('.question');
if (_questions && _questions.length) {
  _questions.forEach(item => {
    item.addEventListener('click', () => {
      const answer = item.nextElementSibling;
      if (answer) answer.classList.toggle('show');
      // Đổi icon (nếu muốn thêm mũi tên)
      item.style.background = answer && answer.classList.contains('show') ? '#068b4d' : '#068b4d';
    });
  });
}

// Xử lý form
const _contactForm = document.getElementById('contactForm');
if (_contactForm) {
  _contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const nameEl = document.getElementById('name');
    const emailEl = document.getElementById('email');
    const phoneEl = document.getElementById('phone');
    const messageEl = document.getElementById('message');

    const name = nameEl ? nameEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.trim() : '';
    const message = messageEl ? messageEl.value.trim() : '';

    if (name && email && message) {
      alert(`Cảm ơn ${name}! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm qua email: ${email}`);
      this.reset();
    } else {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
    }
  });
}
