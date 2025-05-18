require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');


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
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'daomanhphu123@gmail.com',
    pass: 'nndy pxky qfbq hqrd' // Dùng "App Password" nếu bật 2FA
  }
});

// Tạo mã xác nhận ngẫu nhiên 6 số
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
// API Đăng ký
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    const verificationCode = generateVerificationCode();
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
      'INSERT INTO users (username, email, password, phone, verification_code, is_verified) VALUES (?, ?, ?, ?,?,?)',
      [username, email, passwordHash, phone, verificationCode, false]
    );
     const mailOptions = {
      from: 'daomanhphu123@gmail.com',
      to: email,
      subject: 'Mã xác nhận đăng ký',
      html: `<p>Mã xác nhận của bạn là: <strong>${verificationCode}</strong></p>`
    };
    await transporter.sendMail(mailOptions);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});
app.post('/api/verify', async (req, res) => {
  const { email, code } = req.body;

  const [rows] = await pool.query(
    'SELECT verification_code FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0 || rows[0].verification_code !== code) {
    return res.status(400).json({ error: 'Mã không hợp lệ' });
  }

  // Cập nhật trạng thái xác thực
  await pool.query(
    'UPDATE users SET is_verified = true WHERE email = ?',
    [email]
  );

  res.json({ message: 'Xác thực thành công!' });
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