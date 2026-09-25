// api/payment-complete.js
// Completes a "User → App" Pi payment once the user has submitted the
// blockchain transaction. Called by the frontend's onReadyForServerCompletion
// callback (and also from onIncompletePaymentFound handling if you add it).

const PI_API_BASE = "https://api.minepi.com/v2";
const PI_API_KEY = process.env.PI_API_KEY; // set this in Vercel > Environment Variables

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { paymentId, txid } = req.body || {};
    if (!paymentId || !txid) {
      return res.status(400).json({ error: "paymentId and txid are required" });
    }
    if (!PI_API_KEY) {
      return res.status(500).json({ error: "PI_API_KEY not configured on server" });
    }

    const response = await fetch(`${PI_API_BASE}/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: "Pi API complete failed", details: text });
    }

    const data = await response.json();
    return res.status(200).json({ message: `Completed payment ${paymentId}`, payment: data });
  } catch (err) {
    console.error("payment-complete error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
