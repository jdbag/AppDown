exports.handler = async (event) => {
  // ── معالجة طلبات CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, Accept, X-Requested-With',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  // رفض أي طريقة غير POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method Not Allowed - Use POST only' }),
    };
  }

  try {
    const apiKey = process.env.PI_API_KEY;

    if (!apiKey) {
      console.error('Missing PI_API_KEY environment variable');
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: 'Server configuration error',
          details: 'Missing PI_API_KEY environment variable',
        }),
      };
    }

    // قراءة وتحليل الـ body بأمان
    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch (e) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }

    // استخراج paymentId بأكبر قدر ممكن من المرونة
    const paymentId =
      payload.paymentId ||
      payload.identifier ||
      payload.id ||
      payload.payment_id ||
      payload?.payment?.id ||
      payload?.paymentDTO?.identifier ||
      payload?.paymentDTO?.paymentId ||
      payload?.paymentDTO?.id;

    if (!paymentId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: 'paymentId is required',
          received_keys: Object.keys(payload),
          received_payload: payload,
          example: { paymentId: 'pay_abc123xyz' },
        }),
      };
    }

    const url = `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/cancel`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      // ملاحظة: حسب وثائق Pi → لا يوجد body مطلوب في طلب الإلغاء
    });

    const responseText = await response.text();

    // محاولة تحليل الرد كـ JSON، وإلا نعيد النص الخام
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { raw_response: responseText };
    }

    const success = response.ok;

    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success,
        status: response.status,
        message: success ? 'Payment cancelled successfully' : 'Failed to cancel payment',
        pi_response: result,
      }),
    };
  } catch (err) {
    console.error('Error in pi-cancel endpoint:', err);

    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: 'Internal server error while trying to cancel payment',
        message: err.message || 'Unknown error',
      }),
    };
  }
};
