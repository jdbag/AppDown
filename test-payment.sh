#!/bin/bash

# 1. إنشاء دفع بالعملة π
echo "🔹 إنشاء دفع..."
response=$(curl -s -X POST http://localhost:5002/pay \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "currency": "π",
    "userId": "test-user"
  }')

echo "رد السيرفر:"
echo "$response"

# استخراج paymentId من الرد
paymentId=$(echo $response | grep -o '"paymentId":"[^"]*"' | cut -d':' -f2 | tr -d '"')

echo "🔹 paymentId المستخرج: $paymentId"

# 2. تأكيد الدفع
echo "🔹 تأكيد الدفع..."
confirm=$(curl -s -X POST http://localhost:5002/pay/confirm \
  -H "Content-Type: application/json" \
  -d "{
    \"paymentId\": \"$paymentId\"
  }")

echo "رد التأكيد:"
echo "$confirm"

# 3. جلب حالة الدفع
echo "🔹 جلب حالة الدفع..."
status=$(curl -s -X POST http://localhost:5002/pay/status \
  -H "Content-Type: application/json" \
  -d "{
    \"paymentId\": \"$paymentId\"
  }")

echo "رد الحالة:"
echo "$status"

# 4. طباعة رسالة نجاح أو فشل
if echo "$status" | grep -q '"status":"completed"'; then
  echo "✅ الدفع اكتمل بنجاح"
elif echo "$status" | grep -q '"status":"failed"'; then
  echo "❌ الدفع فشل"
else
  echo "⚠️ الدفع ما زال قيد المعالجة"
fi
