// public/js/pi-payment.js - نسخة عملية يناير 2026

let piUser = null;

async function initializePi() {
    try {
        Pi.init({ version: "2.0", sandbox: true });  // ← غيّر false للإنتاج لاحقاً

        piUser = await Pi.authenticate(['username', 'payments'], (payment) => {
            console.warn("دفع غير مكتمل موجود:", payment);
            // يمكنك معالجته هنا لاحقاً
        });

        console.log("تم تسجيل الدخول بنجاح:", piUser.user.username);
        const btn = document.getElementById("pi-pay-button");
        if (btn) btn.disabled = false;
    } catch (err) {
        console.error("فشل تهيئة / مصادقة Pi:", err);
        alert("تعذر الاتصال بمحفظة Pi");
    }
}

async function startPiPayment(amount = 10, memo = "اختبار شراء من AppDown") {
    if (!piUser) {
        alert("يرجى الانتظار حتى يكتمل تسجيل الدخول");
        return;
    }

    const paymentData = {
        amount: Number(amount),
        memo: memo,
        metadata: { source: "AppDown", test: true }
    };

    const paymentCallbacks = {
        onReadyForServerApproval: async function(paymentId) {
            try {
                const response = await fetch("/api/payment/approve", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId })
                });
                console.log("موافقة من السيرفر:", await response.json());
            } catch (e) {
                console.error("فشل طلب الموافقة:", e);
            }
        },

        onReadyForServerCompletion: async function(paymentId, txid) {
            try {
                const response = await fetch("/api/payment/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId, txid })
                });
                const result = await response.json();
                if (result.success) {
                    alert(`تم الدفع بنجاح!\nمعاملة: ${txid}`);
                }
            } catch (e) {
                alert("حدث خطأ أثناء إكمال الدفع");
            }
        },

        onCancel: () => alert("تم إلغاء الدفع"),
        onError: (error) => alert("خطأ في الدفع: " + (error.message || "غير معروف"))
    };

    try {
        await Pi.createPayment(paymentData, paymentCallbacks);
    } catch (err) {
        console.error("خطأ إنشاء دفع:", err);
        alert("تعذر بدء عملية الدفع");
    }
}

// تشغيل التهيئة فور تحميل الصفحة
document.addEventListener("DOMContentLoaded", initializePi);
