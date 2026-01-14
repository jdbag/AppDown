exports.handler = async (event) => {
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method Not Allowed - POST only' })
    };
  }

  try {
    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) {
      console.error('Missing PI_API_KEY');
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    const payload = JSON.parse(event.body || '{}');

    const paymentId = 
      payload.paymentId ||
      payload.identifier ||
      payload.id ||
      payload.payment_id ||
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
          error: 'paymentId and txid are both required',
          received_keys: Object.keys(payload)
        })
      };
    }

    const url = `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/complete`;

    const formData = new URLSearchParams();
    formData.append('txid', txid);

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData.toString()
    });

    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return {
      statusCode: resp.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: resp.ok,
        status: resp.status,
        pi_response: data
      })
    };

  } catch (err) {
    console.error('pi-complete error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: 'Internal server error',
        message: err.message || 'Unknown error'
      })
    };
  }
};      statusCode,
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
