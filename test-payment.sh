#!/bin/bash
set -e

echo "🔎 القيم المضبوطة في البيئة:"
echo "PI_PAYMENT_ID = ${PI_PAYMENT_ID:-❌ غير مضبوط}"
echo "PI_TXID       = ${PI_TXID:-❌ غير مضبوط}"
echo "PI_API_KEY    = ${PI_API_KEY:0:8}********"

if [ -z "$PI_PAYMENT_ID" ]; then
  echo "❌ لم يتم ضبط PI_PAYMENT_ID في البيئة"
  exit 1
fi

echo "🚀 اختبار الموافقة (approve) لـ $PI_PAYMENT_ID"
curl -s -o /tmp/approve.json -w "➡️ Status: %{http_code}\n" \
  -X POST https://api.minepi.com/v2/payments/$PI_PAYMENT_ID/approve \
  -H "Authorization: Key $PI_API_KEY" \
  -H "Content-Type: application/json"
cat /tmp/approve.json

echo "🚀 اختبار الإلغاء (cancel) لـ $PI_PAYMENT_ID"
curl -s -o /tmp/cancel.json -w "➡️ Status: %{http_code}\n" \
  -X POST https://api.minepi.com/v2/payments/$PI_PAYMENT_ID/cancel \
  -H "Authorization: Key $PI_API_KEY" \
  -H "Content-Type: application/json"
cat /tmp/cancel.json

echo "🚀 اختبار الإتمام (complete) لـ $PI_PAYMENT_ID"
curl -s -o /tmp/complete.json -w "➡️ Status: %{http_code}\n" \
  -X POST https://api.minepi.com/v2/payments/$PI_PAYMENT_ID/complete \
  -H "Authorization: Key $PI_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "txid=$PI_TXID"
cat /tmp/complete.json
