exports.handler = async (event) => {
  // ── CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  // فقط POST مسموح
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method Not Allowed - POST only' }),
    };
  }

  try {
    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) {
      console.error('PI_API_KEY غير موجود في Environment Variables');
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'خطأ في إعداد السيرفر (API Key مفقود)' }),
      };
    }

    // Parse الـ body بأمان
    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'البيانات المرسلة ليست JSON صالح' }),
      };
    }

    // استخراج paymentId و txid (مرن لمعظم أنماط الـ frontend)
    const paymentId =
      payload.paymentId ||
      payload.identifier ||
      payload.id ||
      payload.payment_id ||
      payload?.payment?.identifier ||
      payload?.paymentDTO?.identifier ||
      payload?.paymentDTO?.paymentId ||
      payload?.paymentDTO?.id;

    const txid =
      payload.txid ||
      payload.transactionId ||
      payload.txId ||
      payload?.paymentDTO?.txid ||
      payload?.paymentDTO?.transaction?.txid;

    if (!paymentId || !txid) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: 'مطلوب كلا الحقلين: paymentId و txid',
          received_keys: Object.keys(payload),
          tip: 'مثال: { "paymentId": "pay_abc123", "txid": "txn_xyz789" }',
        }),
      };
    }

    const url = `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/complete`;

    const formData = new URLSearchParams();
    formData.append('txid', txid);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: formData.toString(),
    });

    const responseText = await response.text();
    let resultData;

    try {
      resultData = JSON.parse(responseText);
    } catch {
      resultData = { raw_response: responseText };
    }

    const statusCode = response.status;
    const success = response.ok;

    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success,
        status: statusCode,
        message: success ? 'تم إكمال الدفع بنجاح' : 'فشل إكمال الدفع',
        pi_response: resultData,
      }),
    };
  } catch (error) {
    console.error('[pi-complete] خطأ:', error.message);

    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: 'خطأ داخلي أثناء إكمال الدفع',
        message: error.message || 'غير معروف',
      }),
    };
  }
};
