// public/js/pi-payment.js

window.Pi = window.Pi || {};

let authenticatedUser = null;

async function initPi() {
  try {
    Pi.init({ version: "2.0", sandbox: process.env.PI_SANDBOX !== 'false' });

    const scopes = ['username', 'payments'];

    authenticatedUser = await Pi.authenticate(scopes, onIncompletePaymentFound);

    console.log('تم المصادقة بنجاح:', authenticatedUser.user.username);
    const btn = document.getElementById('pi-pay-button');
    if (btn) btn.disabled = false;

  } catch (err) {
    console.error('فشل المصادقة مع Pi:', err);
  }
}

function onIncompletePaymentFound(payment) {
  console.warn('وجد دفع غير مكتمل:', payment);
  // يمكنك محاولة إكماله أو إلغاؤه هنا
}

async function createPiPayment(amount = 5, memo = "شراء منتج من AppDown") {
  if (!authenticatedUser) {
    alert('يرجى تسجيل الدخول عبر Pi أولاً');
    return;
  }

  const paymentData = {
    amount: Number(amount),
    memo: memo,
    metadata: { product: "test-product", userId: authenticatedUser.user.uid }
  };

  const callbacks = {
    onReadyForServerApproval: async (paymentId) => {
      try {
        const res = await fetch('/api/payment/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId })
        });
        const data = await res.json();
        console.log('نتيجة الموافقة:', data);
      } catch (err) {
        console.error('فشل طلب الموافقة:', err);
      }
    },

    onReadyForServerCompletion: async (paymentId, txid) => {
      try {
        const res = await fetch('/api/payment/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, txid })
        });
        const data = await res.json();
        if (data.success) {
          alert(`تم الدفع بنجاح!\nTxID: ${txid}`);
          // هنا: توجيه المستخدم لتحميل المنتج أو عرض رسالة نجاح
        }
      } catch (err) {
        alert('حدث خطأ أثناء إكمال الدفع');
      }
    },

    onCancel: () => alert('تم إلغاء عملية الدفع'),
    onError: (error) => alert('خطأ في عملية الدفع: ' + error.message)
  };

  try {
    await Pi.createPayment(paymentData, callbacks);
  } catch (err) {
    console.error('فشل إنشاء الدفع:', err);
    alert('تعذر بدء عملية الدفع');
  }
}

// تشغيل التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initPi);

// مثال على الاستخدام في HTML:
// <button id="pi-pay-button" disabled onclick="createPiPayment(10, 'شراء كتاب')">ادفع 10 π</button>
