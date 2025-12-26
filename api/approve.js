export default function handler(req, res) {
  if (req.method === "POST") {
    const { paymentId } = req.body;

    // ✅ معالجة الدفع أو حفظه في قاعدة بياناتك
    console.log("📌 Received paymentId:", paymentId);

    // ✅ الرد بصيغة JSON صحيحة
    res.status(200).json({ success: true, paymentId });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
