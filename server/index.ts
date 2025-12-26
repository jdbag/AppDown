import express from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(express.static("public"));
app.use(express.json());

// مسار إنشاء دفع
app.post("/pay", async (req, res) => {
  try {
    const { amount, currency, userId } = req.body;

    const response = await axios.post("https://api.minepi.com/v2/payments", {
      amount,
      memo: `دفع ${amount} ${currency} من المستخدم ${userId}`,
      metadata: { userId },
    }, {
      headers: {
        Authorization: `Bearer ${process.env.PI_API_KEY}`,
      },
    });

    res.json({ success: true, payment: response.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "فشل الدفع" });
  }
});

// مسار تأكيد الدفع
app.post("/pay/confirm", async (req, res) => {
  try {
    const { paymentId } = req.body;

    const response = await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {}, {
      headers: {
        Authorization: `Bearer ${process.env.PI_API_KEY}`,
      },
    });

    res.json({ success: true, confirmed: response.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "فشل تأكيد الدفع" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل على http://localhost:${PORT}`);
});

// ✅ مسار موافقة الدفع من Pi SDK
app.post("/approve", async (req, res) => {
  try {
    const { paymentId } = req.body;

    // استدعاء Pi API للتحقق من الدفع
    const response = await fetch("https://api.minepi.com/v2/payments/" + paymentId + "/approve", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    console.log("✅ تمت الموافقة على الدفع:", data);
    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ خطأ في الموافقة:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ مسار إكمال الدفع من Pi SDK
app.post("/complete", async (req, res) => {
  try {
    const { paymentId } = req.body;

    // استدعاء Pi API لإكمال الدفع
    const response = await fetch("https://api.minepi.com/v2/payments/" + paymentId + "/complete", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    console.log("✅ تم إكمال الدفع:", data);
    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ خطأ في الإكمال:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ مسار مراجعة حالة الدفع من Pi SDK
app.post("/status", async (req, res) => {
  try {
    const { paymentId } = req.body;

    // استدعاء Pi API لجلب حالة الدفع
    const response = await fetch("https://api.minepi.com/v2/payments/" + paymentId, {
      method: "GET",
      headers: {
        "Authorization": `Key ${process.env.PI_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    console.log("ℹ️ حالة الدفع:", data);
    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ خطأ في جلب الحالة:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
