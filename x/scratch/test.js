const fetch = require('node-fetch'); // wait, node-fetch might not be installed. Let's use standard HTTP or dynamic import, or let's use the built-in fetch if Node 18+ is used. Since Node is v22.20.0, global fetch is available!

async function runTests() {
  try {
    console.log('Testing /api/auth/login with valid admin credentials...');
    const loginRes = await fetch('http://127.0.0.1:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password123' })
    });
    
    console.log('Login Response Status:', loginRes.status);
    const loginData = await loginRes.json();
    console.log('Login Response Data:', loginData);
    
    if (loginRes.ok && loginData.token) {
      console.log('Login successful! Testing /api/auth/verify...');
      const verifyRes = await fetch('http://127.0.0.1:3000/api/auth/verify', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      });
      console.log('Verify Response Status:', verifyRes.status);
      const verifyData = await verifyRes.json();
      console.log('Verify Response Data:', verifyData);
    } else {
      console.error('Login failed.');
    }
  } catch (err) {
    console.error('Test error:', err);
  }
}

runTests();
