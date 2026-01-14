exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing PI_API_KEY' })
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

    if (!paymentId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          error: 'paymentId is required',
          received_keys: Object.keys(payload)
        })
      };
    }

    const url = `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/approve`;

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
      // لا يوجد body في approve حسب الوثائق الرسمية
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
    console.error('pi-approve error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal error', message: err.message })
    };
  }
};        success: response.ok,
        status: response.status,
        pi_response: result,
      }),
    };
  } catch (err) {
    console.error('Error in pi-approve:', err);

    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        error: 'Internal server error',
        message: err.message || 'Unknown error',
      }),
    };
  }
};
