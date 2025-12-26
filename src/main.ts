import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Hello AppDown!</h1>
  <p>مشروعك يعمل الآن باستخدام Vite 🚀</p>
`;

document.getElementById("payBtn")?.addEventListener("click", async () => {
  try {
    const response = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 1, currency: "Pi" })
    });
    const result = await response.json();
    alert("تم الدفع بنجاح: " + JSON.stringify(result));
  } catch (err: any) {
    alert("خطأ أثناء الدفع: " + err.message);
  }
});
