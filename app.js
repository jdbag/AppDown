// app.js - AppDown Server (Node.js + Express + Pi Network Payments)

const express = require('express');
const path = require('path');
const mariadb = require('mariadb');
const dotenv = require('dotenv');

// تحميل المتغيرات البيئية
dotenv.config();

const app = express();

// Middleware
app.use(express.json());                    // لقراءة JSON في الـ body
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // للملفات الثابتة (js, css, images)

// محرك القوالب (Pug إذا كنت تستخدمه، أو غيّره إلى ejs أو غيره)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');              // غيّر إلى 'ejs' أو 'html' حسب احتياجك

// اتصال بقاعدة البيانات MariaDB
const pool = mariadb.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || '.2',
  database: process.env.DB_NAME || 'appdown',
  connectionLimit: 10
});

// اختبار الاتصال عند بدء السيرفر (اختياري)
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('MariaDB connected successfully');
    conn.release();
  } catch (err) {
    console.error('Database connection failed:', err);
  }
})();

// -------------------
// Routes الأساسية
// -------------------

// صفحة رئيسية (مثال)
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'AppDown Store',
    message: 'مرحبا بك في متجر AppDown - الدفع بـ Pi Network'
  });
});

// حالة السيرفر + اختبار DB
app.get('/status', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT NOW() as time');
    conn.release();
    res.json({ 
      status: 'running',
      database: 'connected',
      serverTime: rows[0].time 
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// -------------------
// تكامل الدفع مع Pi Network
// -------------------

const paymentRouter = require('./routes/payment');
app.use('/api/payment', paymentRouter);   // ← الإضافة المهمة التي طلبتها

// مثال: endpoint بسيط لإنشاء دفع محلي (fallback إذا أردت)
app.post('/api/payments/local-create', async (req, res) => {
  const { userId, amount } = req.body;
  try {
    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO payments (user_id, amount, status) VALUES (?, ?, "pending")',
      [userId, amount]
    );
    conn.release();
    res.json({ success: true, message: 'دفع محلي تم إنشاؤه' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------
// تشغيل السيرفر
// -------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`AppDown Server يعمل على المنفذ ${PORT}`);
  console.log(`- الوضع: ${process.env.NODE_ENV || 'development'}`);
  console.log(`- Pi Sandbox: ${process.env.PI_SANDBOX !== 'false' ? 'مفعّل' : 'معطّل'}`);
});

// للتعامل مع إغلاق السيرفر بشكل نظيف (اختياري)
process.on('SIGTERM', () => {
  console.log('إغلاق السيرفر...');
  pool.end();
  process.exit(0);
});
