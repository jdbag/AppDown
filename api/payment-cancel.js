// api/payment-cancel.js
// Records a cancelled Pi payment. Pi's servers auto-cancel a payment if it
// isn't approved within 60 seconds, or the user/app can cancel it directly.
// There is no Pi Platform API call required here — this endpoint just lets
// you log/track the cancellation on your own side if you want to.

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { paymentId } = req.body || {};
    if (!paymentId) {
      return res.status(400).json({ error: "paymentId is required" });
    }

    console.log(`Payment cancelled: ${paymentId}`);
    // TODO: if you keep orders in a database, mark the matching order as
    // cancelled here.

    return res.status(200).json({ message: `Recorded cancellation for ${paymentId}` });
  } catch (err) {
    console.error("payment-cancel error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
