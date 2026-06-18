document.addEventListener('DOMContentLoaded', () => {
  const sessionToken = sessionStorage.getItem('summership_token');

  // 1. Initial local token presence check
  if (!sessionToken) {
    clearSessionAndRedirect();
    return;
  }

  // 2. Perform server-side token validation
  fetch('/api/auth/verify', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${sessionToken}`
    }
  })
  .then(async (response) => {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Token verification failed.');
    }
    return data;
  })
  .then((data) => {
    // Authorized! Populate display details
    const userDisplayName = document.getElementById('userDisplayName');
    if (userDisplayName) {
      // Capitalize first letter
      const formattedName = data.username.charAt(0).toUpperCase() + data.username.slice(1);
      userDisplayName.textContent = formattedName;
    }
  })
  .catch((err) => {
    console.error('Session verification error:', err);
    clearSessionAndRedirect();
  });

  // --- Logout Action ---
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearSessionAndRedirect();
    });
  }

  function clearSessionAndRedirect() {
    sessionStorage.removeItem('summership_token');
    sessionStorage.removeItem('summership_auth');
    window.location.replace('index.html');
  }
});
