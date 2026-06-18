const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/summership';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from current directory
app.use(express.static(__dirname));

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB database connection established.'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.log('Ensure that your local MongoDB server is running on port 27017.');
  });

// --- API Routes ---

// 1. POST /api/auth/login (Authenticate user and return session token)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Request Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Find User in MongoDB
    const searchName = username.trim().toLowerCase();
    const user = await User.findOne({ username: searchName });
    
    if (!user) {
      return res.status(401).json({ error: 'Identity credentials rejected.' });
    }

    // Match password hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Identity credentials rejected.' });
    }

    // Generate JWT Token (valid for 2 hours)
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'summership_jwt_fallback_key',
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Authentication successful.',
      token,
      username: user.username
    });
  } catch (err) {
    console.error('Server error during login:', err);
    res.status(500).json({ error: 'Internal server error occurred.' });
  }
});

// 2. GET /api/auth/verify (Verify session JWT and return details)
app.get('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required.' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify Token Signature
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'summership_jwt_fallback_key'
    );

    res.json({
      message: 'Token authorized.',
      username: decoded.username
    });
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ error: 'Invalid or expired token session.' });
  }
});

// Fallback: Route direct requests to index.html/welcome.html if hit directly
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/welcome', (req, res) => {
  res.sendFile(path.join(__dirname, 'welcome.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`Summership Auth Service started!`);
  console.log(`Portal Gateway: http://127.0.0.1:${PORT}`);
  console.log(`========================================`);
});
