// api/pi-complete.js
// Serverless function لإكمال دفع Pi Network (Server-Side Completion)

export default async function handler(req, res) {
  // معالجة CORS (مهم جداً للاتصال من الـ frontend)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'الطريقة غير مسموحة - استخدم POST فقط' });
  }

  const apiKey = process.env.PI_API_KEY;
  if (!apiKey) {
    console.error('PI_API_KEY غير موجود في المتغيرات البيئية');
    return res.status(500).json({ error: 'خطأ في إعداد السيرفر' });
  }

  const body = req.body || {};
  let paymentId = body.paymentId || body.identifier || body.id || body.payment_id;
  let txid = body.txid || body.transactionId || body.txId;

  // دعم حالات إضافية شائعة
  if (!paymentId && body.paymentDTO) {
    paymentId = body.paymentDTO.identifier || body.paymentDTO.paymentId || body.paymentDTO.id;
  }
  if (!txid && body.paymentDTO?.transaction) {
    txid = body.paymentDTO.transaction.txid;
  }

  if (!paymentId || !txid) {
    return res.status(400).json({
      error: 'مطلوب: paymentId و txid',
      received: Object.keys(body),
      مثال: { paymentId: 'pay_abc123', txid: 'txn_xyz789' }
    });
  }

  try {
    const url = `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/complete`;

    const formData = new URLSearchParams();
    formData.append('txid', txid);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData.toString()
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { responseText: text };
    }

    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: 'تم إكمال الدفع بنجاح',
        piData: data
      });
    } else {
      return res.status(response.status).json({
        success: false,
        error: 'فشل إكمال الدفع من Pi',
        status: response.status,
        piData: data
      });
    }
  } catch (error) {
    console.error('خطأ في إكمال الدفع:', error.message);
    return res.status(500).json({
      error: 'خطأ داخلي أثناء الاتصال بـ Pi API',
      message: error.message
    });
  }
}
