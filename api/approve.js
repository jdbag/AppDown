import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: "Missing paymentId" });
    }

    try {
      // ✅ استدعاء Pi Server API للتحقق من الدفع
      const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
        method: "POST",
        headers: {
          "Authorization": `Key ${process.env.PI_API_KEY}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      // ✅ إرسال الرد للـ Frontend
      res.status(200).json(data);
    } catch (error) {
      console.error("❌ Error approving payment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
