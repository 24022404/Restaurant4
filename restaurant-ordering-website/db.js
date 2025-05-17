require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');


const app = express();
app.use(cors());
app.use(bodyParser.json());
// Kết nối database
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'restaurant',
  password: '071205', // Replace with your MySQL password
  waitForConnections: true,
});

// API endpoint
app.get('/api/menu-items', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM meals');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// API Đăng ký
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    
    // Kiểm tra user tồn tại
    const [existing] = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Lưu vào database
    await pool.query(
      'INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, phone]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API Đăng nhập
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user trong database
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Tài khoản không tồn tại' });
    }

    const user = users[0];

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mật khẩu không đúng' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Trả về thông tin user (không trả password)
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API lấy thông tin user (cần xác thực)
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [req.user.userId]
    );
    
    if (users.length === 0) return res.sendStatus(404);
    
    res.json(users[0]);
  } catch (error) {
    res.sendStatus(500);
  }
});

app.listen(4000, () => console.log('Server running'));