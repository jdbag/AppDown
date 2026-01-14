const express = require('express');
const router = express.Router();
const axios = require('axios');

const PI_API_KEY = process.env.PI_API_KEY || '';

router.post('/approve', async (req, res) => {
  const { paymentId } = req.body;
  if (!PI_API_KEY) return res.status(500).json({ error: 'API key missing' });

  try {
    await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {}, {
      headers: { Authorization: `Key ${PI_API_KEY}` }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/complete', async (req, res) => {
  const { paymentId, txid } = req.body;
  // ← هنا تضيف منطق تسليم المنتج / حفظ في db
  console.log(`Payment completed: ${paymentId} → Tx ${txid}`);
  res.json({ success: true });
});

module.exports = router;
