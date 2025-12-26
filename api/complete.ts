console.log("🔑 PI_API_KEY =", process.env.PI_API_KEY);
console.log("🔑 PI_API_KEY =", process.env.PI_API_KEY);
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  try {
    const { paymentId } = req.body;
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: { "Authorization": `Key ${process.env.PI_API_KEY}`, "Content-Type": "application/json" }
    });
    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
