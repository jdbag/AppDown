const AppDownSDK = require("./appdown-sdk");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// قراءة الـ API Key من .env
const PI_API_KEY = process.env.PI_API_KEY;

// اختبار السيرفر
app.get('/', (req, res) => {
  res.send('✅ AppDown Pi Backend يعمل');
});

// Endpoint للتحقق من الدفع عبر Pi
app.post('/verify-payment', async (req, res) => {
  const { paymentId } = req.body;

  try {
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

// Stripe endpoint
app.post('/checkout', async (req, res) => {
  try {
    const { name, amount } = req.body;
    const session = await AppDownSDK.createStripeCheckout({ name, amount });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pi endpoint
app.post('/verify-payment', async (req, res) => {
  try {
    const { paymentId } = req.body;
    const result = await AppDownSDK.verifyPiPayment(paymentId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
