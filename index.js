require('dotenv').config();

const required = [
  'PORT',
  'JWT_SECRET',
  'DB_HOST',
  'DB_USER',
  'DB_PASS',
  'DB_NAME',
  'EMAIL_USER',
  'EMAIL_PASS'
];
required.forEach(key => {
  if (!process.env[key]) {
    console.error('Thiếu biến môi trường: ${key}');
    process.exit(1);
  }
});
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
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
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

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
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
    // Kiểm tra user tồn tại
    const [existing] = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }

    // Hash password và sinh code
    const verificationCode = generateVerificationCode();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Lưu vào database
    await pool.query(
      'INSERT INTO users (username, email, password, phone, verification_code, is_verified) VALUES (?, ?, ?, ?,?,?)',
      [username, email, passwordHash, phone, verificationCode, false]
    );
     const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mã xác nhận đăng ký',
      html: `<p>Mã xác nhận của bạn là: <strong>${verificationCode}</strong></p>`
    };
    await transporter.sendMail(mailOptions);
    // Tạo verificationToken
    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );
    res.status(201).json({
      message: 'Mã xác nhận đã gửi. Vui lòng nhập mã để hoàn tất.',
      verificationToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});
app.post('/api/register/verify', async (req, res) => {
  const { token, code } = req.body;
  try {
  const { email } = jwt.verify(token, process.env.JWT_SECRET);

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
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Token xác thực đã hết hạn' });
    }
    console.error('Confirmation error:', err);
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
      process.env.JWT_SECRET,
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


app.get('/api/rooms', authenticateToken, async (req, res) => {
  const floor = req.query.floor;  // “1”, “2” hoặc “3” (3 là VIP)
  let sql, params = [];

  if (floor === '3') {
    sql = 'SELECT id, name, capacity FROM rooms WHERE category = "VIP"';
  } else {
    sql = 'SELECT id, name, capacity FROM rooms WHERE category = ?';
    params = [`Tầng ${floor}`];
  }

  try {
    const [rooms] = await pool.query(sql, params);
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/bookings/rooms', authenticateToken, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT room_id FROM bookings WHERE booking_date = ? AND booking_time = ?',
    [req.query.date, req.query.time]
  );
  res.json(rows.map(r => r.room_id));
});

// API tạo booking mới
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      room_id,       // tương ứng với cột room_id
      booking_date,  // YYYY-MM-DD
      booking_time,  // HH:MM:SS hoặc HH:MM
      party_size,    // số người
      note           // tùy chọn
    } = req.body;

    // (1) Validate input
    if (!room_id || !booking_date || !booking_time || !party_size) {
      return res.status(400).json({ error: 'Thiếu thông tin đặt bàn' });
    }

    // (2) Chèn vào database
    const [result] = await pool.query(
      `INSERT INTO bookings 
         (user_id, room_id, booking_date, booking_time, party_size, note)
       VALUES (?,       ?,       ?,            ?,            ?,         ?)`,
      [userId, room_id, booking_date, booking_time, party_size, note || null]
    );

    // (3) Lấy ID của bản ghi mới
    const bookingId = result.insertId;

    // (4) Trả về thông tin booking
    res.status(201).json({
      message: 'Đặt bàn thành công',
      booking: {
        id: bookingId,
        user_id: userId,
        room_id,
        booking_date,
        booking_time,
        party_size,
        note: note || '',
        status: 'pending',
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
    });

  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});


// Danh sách booking (chỉ admin)
app.get('/api/bookings', authenticateToken, async (req, res) => {
  const { status } = req.query;          // e.g. ?status=pending
  let sql = `SELECT b.id, b.booking_date, b.booking_time, b.party_size, b.note,
                    u.username AS customer_name, u.phone,
                    r.name AS room_name, r.category
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN rooms r ON b.room_id = r.id`;
  const params = [];

  if (status) {
    sql += ' WHERE b.status = ?';
    params.push(status);
  }

  const [rows] = await pool.query(sql, params);
  // map lại thành cấu trúc dễ xài phía frontend
  const bookings = rows.map(r => ({
    id: r.id,
    booking_date: r.booking_date,
    booking_time: r.booking_time,
    party_size: r.party_size,
    note: r.note,
    customer: { name: r.customer_name, phone: r.phone },
    room: { name: r.room_name, category: r.category }
  }));
  res.json(bookings);
});


// Xác nhận booking
app.post('/api/bookings/:id/confirm', authenticateToken, async (req, res) => {
  const id = req.params.id;
  await pool.query('UPDATE bookings SET status = ? WHERE id = ?', ['confirmed', id]);
  res.json({ success: true });
});

app.post('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
  const { id } = req.params;
  await pool.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id]);
  res.json({ success: true });
});

app.get('/api/bookings/rooms', authenticateToken, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT room_id FROM bookings WHERE booking_date = ? AND booking_time = ? AND status = ?',
    [req.query.date, req.query.time, 'confirmed']
  );
  res.json(rows.map(r => r.room_id));
});



const PORT = process.env.PORT;
app.listen(PORT, () => console.log('Server running on port ' + PORT));