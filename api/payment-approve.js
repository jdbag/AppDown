// api/payment-approve.js
// Approves a "User → App" Pi payment on the Pi Platform servers.
// Called by the frontend's onReadyForServerApproval callback.

const PI_API_BASE = "https://api.minepi.com/v2";
const PI_API_KEY = process.env.PI_API_KEY; // set this in Vercel > Environment Variables

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { paymentId } = req.body || {};
    if (!paymentId) {
      return res.status(400).json({ error: "paymentId is required" });
    }
    if (!PI_API_KEY) {
      return res.status(500).json({ error: "PI_API_KEY not configured on server" });
    }

    const response = await fetch(`${PI_API_BASE}/payments/${paymentId}/approve`, {
      method: "POST",
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: "Pi API approve failed", details: text });
    }

    const data = await response.json();
    return res.status(200).json({ message: `Approved payment ${paymentId}`, payment: data });
  } catch (err) {
    console.error("payment-approve error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
