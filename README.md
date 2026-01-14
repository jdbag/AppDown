# AppDown – متجر يدعم الدفع بـ Pi Network

متجر بسيط (أو منصة تنزيل/بيع منتجات رقمية) مبني باستخدام Node.js + Express،  
يدعم عملية الدفع باستخدام Pi Network (User-to-App payments).

## المتطلبات الأساسية

- Node.js ≥ 18
- حساب مطور Pi Network (https://minepi.com/developers)
- Server API Key و App ID من Developer Portal

## التثبيت السريع (محلياً)

```bash
git clone https://github.com/jdbag/AppDown.git
cd AppDown
npm install
cp .env.local .env
# عدّل .env بقيمك الفعلية
npm start
# أو npm run dev إذا كنت تستخدم vite للـ frontend
### اختبار الدفع بـ Pi Network (Sandbox)

1. شغّل السيرفر محلياً أو على Vercel
2. افتح الموقع في **Pi Browser** (مهم جداً)
3. اضغط على زر "ادفع 10 π"
4. ستظهر واجهة دفع Pi Test → أكملها
5. راقب الـ console في الـ backend لترى رسائل الموافقة والإكمال

**ملاحظة مهمة**:  
الدفع في وضع Sandbox يستخدم Pi وهمي فقط.  
للانتقال للـ Mainnet غيّر `sandbox: false` في `pi-payment.js` و `PI_SANDBOX=false` في .env
