document.addEventListener('DOMContentLoaded', () => {
  // Form elements
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');

  // Toggle button & Icon elements
  const passwordToggleBtn = document.getElementById('passwordToggleBtn');
  const eyeIconOpen = document.getElementById('eyeIconOpen');
  const eyeIconClosed = document.getElementById('eyeIconClosed');

  // Validation feedback elements
  const usernameError = document.getElementById('usernameError');
  const passwordError = document.getElementById('passwordError');
  const authAlert = document.getElementById('authAlert');
  const authAlertText = document.getElementById('authAlertText');

  // --- 1. Password Visibility Toggle ---
  passwordToggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    if (isPassword) {
      passwordInput.setAttribute('type', 'text');
      eyeIconOpen.style.display = 'none';
      eyeIconClosed.style.display = 'block';
    } else {
      passwordInput.setAttribute('type', 'password');
      eyeIconOpen.style.display = 'block';
      eyeIconClosed.style.display = 'none';
    }
  });

  // --- 2. Real-time validation clearance ---
  usernameInput.addEventListener('input', () => {
    usernameError.style.display = 'none';
    authAlert.style.display = 'none';
  });

  passwordInput.addEventListener('input', () => {
    passwordError.style.display = 'none';
    authAlert.style.display = 'none';
  });

  // --- 3. Form Submit & API Handshake ---
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset feedback
    usernameError.style.display = 'none';
    passwordError.style.display = 'none';
    authAlert.style.display = 'none';

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    let isValid = true;

    // Validate fields
    if (!username) {
      usernameError.style.display = 'flex';
      isValid = false;
    }

    if (!password) {
      passwordError.style.display = 'flex';
      isValid = false;
    }

    if (!isValid) return;

    // Loading indicator state
    setLoading(true);

    // Call express API backend
    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication handshake rejected.');
      }
      return data;
    })
    .then((data) => {
      // Store session token and user name in sessionStorage
      sessionStorage.setItem('summership_token', data.token);
      sessionStorage.setItem('summership_auth', data.username);
      
      // Redirect to separate welcome page
      window.location.href = 'welcome.html';
    })
    .catch((err) => {
      setLoading(false);
      authAlertText.textContent = err.message || 'Incorrect username or password.';
      authAlert.style.display = 'flex';
      passwordInput.value = '';
      passwordInput.focus();
    });
  });

  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      usernameInput.disabled = true;
      passwordInput.disabled = true;
      passwordToggleBtn.disabled = true;
      btnText.textContent = 'Verifying Handshake...';
      btnSpinner.style.display = 'block';
    } else {
      submitBtn.disabled = false;
      usernameInput.disabled = false;
      passwordInput.disabled = false;
      passwordToggleBtn.disabled = false;
      btnText.textContent = 'Sign In';
      btnSpinner.style.display = 'none';
    }
  }
});
