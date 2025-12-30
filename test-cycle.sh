#!/bin/bash
set -e  # يوقف السكربت عند أول خطأ

echo "🚀 بدء اختبار دورة الدفع كاملة..."

echo "▶️ اختبار الموافقة (approve)"
curl -f -X POST http://localhost:3000/api/pi-approve \
  -H "Content-Type: application/json" \
  -d '{"paymentId":"12345"}'

echo "✅ الموافقة نجحت"

echo "▶️ اختبار الإلغاء (cancel)"
curl -f -X POST http://localhost:3000/api/pi-cancel \
  -H "Content-Type: application/json" \
  -d '{"paymentId":"12345"}'

echo "✅ الإلغاء نجح"

echo "▶️ اختبار الإتمام (complete)"
curl -f -X POST http://localhost:3000/api/pi-complete \
  -H "Content-Type: application/json" \
  -d '{"paymentId":"12345","txid":"abc123"}'

echo "✅ الإتمام نجح"
