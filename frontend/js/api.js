// This automatically uses your local backend while you're developing on
// localhost, and switches to your deployed backend everywhere else.
// After you deploy the backend to Render, replace the placeholder URL below
// with your real Render URL (it will look like https://daybook-api.onrender.com/api).
const API_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://daybook-7ue6.onrender.com/api';

const TOKEN_KEY = 'daybook_token';
const USER_KEY = 'daybook_user';

// A small wrapper around fetch that adds the base URL, the JSON headers,
// and the login token (if we have one) to every request automatically.
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Some responses (like a 204) have no body — that's fine.
  }

  if (!response.ok) {
    throw new Error((data && data.message) || 'Something went wrong. Please try again.');
  }

  return data;
}
