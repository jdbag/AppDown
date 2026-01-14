// public/js/pi-payment.js - Pi Network Payment Button

const Pi = window.Pi;

document.addEventListener('DOMContentLoaded', async function() {
  Pi.init({ version: "2.0", sandbox: true }); // غيّر إلى false للـ Mainnet لاحقًا

  try {
    const scopes = ['payments'];
    await Pi.authenticate(scopes, () => {});
    const btn = document.getElementById('pi-pay-btn');
    if (btn) btn.disabled = false;
  } catch (err) {
    console.error('Authentication failed', err);
  }
});

async function handlePiPayment(amount = 5, memo = "اختبار شراء") {
  const paymentData = {
    amount: amount,
    memo: memo,
    metadata: { item: "test-product" }
  };

  const callbacks = {
    onReadyForServerApproval: paymentId => {
      fetch('/api/payment/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId })
      });
    },
    onReadyForServerCompletion: (paymentId, txid) => {
      fetch('/api/payment/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, txid })
      }).then(() => alert('تم الدفع بنجاح! TxID: ' + txid));
    },
    onCancel: () => alert('تم إلغاء الدفع'),
    onError: err => alert('خطأ: ' + err.message)
  };

  try {
    await Pi.createPayment(paymentData, callbacks);
  } catch (err) {
    console.error('Payment error', err);
  }
}
