
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
// Kết nối database
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'restaurant',
  password: '071205', // Replace with your MySQL password
  waitForConnections: true,
});

// API endpoint
app.get('/api/menu-items', (req, res) => {
  pool.query('SELECT * FROM meals ', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
    console.log('Database connection successful:', results);    
  });
});

app.listen(4000, () => console.log('Server running'));
