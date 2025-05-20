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

app.post('/api/orders', async (req, res) => {
  try {
    const { userId, summary, diningOption, paymentMethod, status, createdAt, items } = req.body;
    // Tạo đơn hàng mới
    const [result] = await pool.query(
      'INSERT INTO orders (user_id, total_price, status, created_at, dining_option, payment_method) VALUES ( ?, ?, ?, ?, ?, ?)',
      [userId, summary, status, createdAt, diningOption, paymentMethod]
    );
    const orderId = result.insertId;
    // Thêm các món vào order_items
    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, meal_id, quantity, price, name) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price, item.name]
      );
    }
    res.json({ success: true, orderId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// API: Lấy danh sách đơn hàng (chỉ admin)
app.get('/api/orders', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.id, o.total_price, o.status, o.created_at, o.dining_option, o.payment_method, u.username AS customer
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API: Lấy chi tiết đơn hàng
app.get('/api/orders/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [[order]] = await pool.query(`
      SELECT o.*, u.username AS customer
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [id]);

    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });

    const [items] = await pool.query(`
      SELECT meal_id, name, quantity, price
      FROM order_items
      WHERE order_id = ?
    `, [id]);

    res.json({ order, items });
  } catch (err) {
    console.error('Get order detail error:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API: Cập nhật trạng thái đơn hàng (chỉ admin)
app.put('/api/orders/:id/status', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['processing', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }
    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API: Xóa đơn hàng và các mục kèm theo
app.delete('/api/orders/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM order_items WHERE order_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }

    res.json({ message: 'Xóa đơn hàng thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.listen(4000, () => console.log('Server running'));