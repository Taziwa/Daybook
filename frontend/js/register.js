document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem(TOKEN_KEY)) {
    window.location.href = 'dashboard.html';
    return;
  }

  const form = document.getElementById('register-form');
  const errorBox = document.getElementById('error-box');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.textContent = '';

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
      errorBox.textContent = 'Passwords do not match';
      return;
    }

    if (password.length < 6) {
      errorBox.textContent = 'Password must be at least 6 characters';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account…';

    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify({ name: data.name, email: data.email }));
      window.location.href = 'dashboard.html';
    } catch (error) {
      errorBox.textContent = error.message;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create account';
    }
  });
});
