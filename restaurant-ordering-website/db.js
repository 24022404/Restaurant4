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
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  database: process.env.MYSQL_DATABASE || 'restaurant',
  password: process.env.MYSQL_PASSWORD || '123ABCabc',
  waitForConnections: true,
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'daomanhphu123@gmail.com',
    pass: process.env.GMAIL_PASS || 'nndy pxky qfbq hqrd'
  }
});

// Tạo mã xác nhận ngẫu nhiên 6 số
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Middleware xác thực token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Không có token' });

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    req.user = user;
    next();
  });
}

// Middleware kiểm tra admin
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Chỉ admin mới có quyền truy cập' });
  }
  next();
}

// Middleware kiểm tra khách hàng
function isCustomer(req, res, next) {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Chỉ khách hàng mới có quyền truy cập' });
  }
  next();
}

// API: Lấy danh sách món ăn (cho cả admin và khách hàng đã đăng nhập)
app.get('/api/menu-items', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM meals');
    res.json(results);
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Thêm món ăn (chỉ admin)
app.post('/api/menu-items', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, category, nation, image, price, availability } = req.body;

    // Debug dữ liệu nhận được
    console.log('Received data for adding meal:', { name, category, nation, image, price, availability });

    // Kiểm tra dữ liệu
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Tên món không hợp lệ' });
    }
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ error: 'Danh mục không hợp lệ' });
    }
    if (typeof price !== 'number' || isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Giá không hợp lệ (phải là số lớn hơn 0)' });
    }
    const validatedAvailability = availability === true || availability === 1 ? 1 : 0;

    const [result] = await pool.query(
      'INSERT INTO meals (name, category, nation, image, price, availability) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), category, nation || null, image || null, price, validatedAvailability]
    );
    res.status(201).json({ message: 'Thêm món ăn thành công', id: result.insertId });
  } catch (error) {
    console.error('Add meal error:', error);
    res.status(500).json({ error: 'Lỗi server: ' + error.message });
  }
});

// API: Sửa món ăn (chỉ admin)
app.put('/api/menu-items/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, nation, image, price, availability } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Tên món không hợp lệ' });
    }
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ error: 'Danh mục không hợp lệ' });
    }
    if (typeof price !== 'number' || isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Giá không hợp lệ (phải là số lớn hơn 0)' });
    }
    const validatedAvailability = availability === true || availability === 1 ? 1 : 0;

    const [result] = await pool.query(
      'UPDATE meals SET name = ?, category = ?, nation = ?, image = ?, price = ?, availability = ? WHERE id = ?',
      [name.trim(), category, nation || null, image || null, price, validatedAvailability, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Món ăn không tồn tại' });
    }
    res.json({ message: 'Cập nhật món ăn thành công' });
  } catch (error) {
    console.error('Update meal error:', error);
    res.status(500).json({ error: 'Lỗi server: ' + error.message });
  }
});

// API: Xóa món ăn (chỉ admin)
app.delete('/api/menu-items/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM meals WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Món ăn không tồn tại' });
    }
    res.json({ message: 'Xóa món ăn thành công' });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ error: 'Lỗi server: ' + error.message });
  }
});

// API Đăng ký
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    const verificationCode = generateVerificationCode();
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email đã tồn tại" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await pool.query(
      'INSERT INTO users (username, email, password, phone, verification_code, is_verified, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, passwordHash, phone, verificationCode, false, 'customer']
    );

    const mailOptions = {
      from: 'daomanhphu123@gmail.com',
      to: email,
      subject: "Mã xác nhận đăng ký",
      html: `<p>Mã xác nhận của bạn là: <strong>${verificationCode}</strong></p>`,
    };
    await transporter.sendMail(mailOptions);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Lỗi server: ' + error.message });
  }
});

// API Xác thực email
app.post('/api/verify', async (req, res) => {
  const { email, code } = req.body;

  const [rows] = await pool.query(
    "SELECT verification_code FROM users WHERE email = ?",
    [email]
  );

  if (rows.length === 0 || rows[0].verification_code !== code) {
    return res.status(400).json({ error: 'Mã không hợp lệ' });
  }

  await pool.query('UPDATE users SET is_verified = true WHERE email = ?', [email]);
  res.json({ message: 'Xác thực thành công!' });
});

// API Đăng nhập
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Tài khoản không tồn tại' });
        }
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Mật khẩu không đúng' });
        }
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );
        res.json({
            token,
            user: { id: user.id, username: user.username, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});

// API lấy thông tin người dùng (chỉ admin)
app.get('/api/me', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    if (users.length === 0) return res.status(404).json({ error: 'Người dùng không tồn tại' });
    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Lỗi server: ' + error.message });
  }
});

// API: Đặt bàn (chỉ customer)
app.post('/api/bookings', async (req, res) => {
  try {
    const { room_id, booking_date, booking_time, party_size, note } = req.body;
    const user_id = req.user.userId;

    if (!room_id || !booking_date || !booking_time || !party_size) {
      return res.status(400).json({ error: 'Thiếu thông tin đặt bàn' });
    }

    // Ghi vào bảng bookings
    await pool.query(
      `INSERT INTO bookings (user_id, room_id, booking_date, booking_time, party_size, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, room_id, booking_date, booking_time, party_size, note || null]
    );

    res.status(201).json({ message: 'Đặt bàn thành công' });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Lỗi server khi đặt bàn' });
  }
});


app.listen(4000, () => console.log('Server running'));