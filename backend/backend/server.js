const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// API Key من Pi Network
const PI_API_KEY = process.env.PI_API_KEY;

// اختبار السيرفر
app.get('/', (req, res) => {
  res.send('✅ AppDown Pi Backend يعمل');
});

// Endpoint للتحقق من الدفع
app.post('/verify-payment', async (req, res) => {
  const { paymentId } = req.body;

  try {
    // استدعاء Pi API للتحقق من الدفع
    const response = await axios.get(`https://api.minepi.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Key ${PI_API_KEY}` }
    });

    const payment = response.data;

    if (payment.status === 'completed') {
      res.json({ success: true, message: '✅ الدفع مكتمل', payment });
    } else {
      res.json({ success: false, message: '❌ الدفع غير مكتمل', payment });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'خطأ في التحقق من الدفع' });
  }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend يعمل على المنفذ ${PORT}`));
