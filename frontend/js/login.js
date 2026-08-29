document.addEventListener('DOMContentLoaded', () => {
  // Already logged in? Skip straight to the task list.
  if (localStorage.getItem(TOKEN_KEY)) {
    window.location.href = 'dashboard.html';
    return;
  }

  const form = document.getElementById('login-form');
  const errorBox = document.getElementById('error-box');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.textContent = '';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in…';

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify({ name: data.name, email: data.email }));
      window.location.href = 'dashboard.html';
    } catch (error) {
      errorBox.textContent = error.message;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log in';
    }
  });
});
