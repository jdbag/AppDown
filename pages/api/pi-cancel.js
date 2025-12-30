export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin','*')
      .setHeader('Access-Control-Allow-Headers','Content-Type')
      .setHeader('Access-Control-Allow-Methods','POST, OPTIONS')
      .send('');
  }
  if (req.method !== 'POST') {
    return res.status(405).setHeader('Access-Control-Allow-Origin','*')
      .json({error:'Method not allowed'});
  }
  const apiKey = process.env.PI_API_KEY;
  if (!apiKey) {
    return res.status(500).setHeader('Access-Control-Allow-Origin','*')
      .json({error:'Missing PI_API_KEY env var'});
  }
  const payload = req.body || {};
  const paymentId = payload.paymentId || payload.identifier || payload.id || payload.payment_id ||
    payload?.paymentDTO?.identifier || payload?.paymentDTO?.paymentId || payload?.paymentDTO?.id;
  if (!paymentId) {
    return res.status(400).setHeader('Access-Control-Allow-Origin','*')
      .json({error:'paymentId is required', receivedKeys:Object.keys(payload||{}), received:payload});
  }
  const url = `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/cancel`;
  const resp = await fetch(url, {method:'POST', headers:{Authorization:`Key ${apiKey}`, 'Content-Type':'application/json'}});
  const text = await resp.text();
  return res.status(resp.status).setHeader('Access-Control-Allow-Origin','*')
    .setHeader('Content-Type','application/json').send(text);
}
