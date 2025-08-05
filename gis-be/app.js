const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./db');
const geoRoutes = require('./routes/geo');
const cors = require('cors');
require('dotenv').config();

// CORS harus di atas semua route
app.use(cors());

// Middleware parsing JSON
app.use(express.json());

// Routes
app.use('/api', geoRoutes);
app.use('/api/admin', require('./routes/batasAdmin'));

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
    const user = result.rows[0];

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '2h' });
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
