import express from "express";

const app = express();
app.use(express.json());

// مسار دفع تجريبي
app.post("/api/pay", (req, res) => {
  const { amount, currency } = req.body;
  console.log("طلب دفع:", amount, currency);

  // هنا تضع منطق الدفع الحقيقي (مثلاً عبر Pi SDK أو أي خدمة دفع)
  res.json({ success: true, message: `تم دفع ${amount} ${currency}` });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل على http://localhost:${PORT}`);
});
