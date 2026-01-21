import https from "https";

const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY || "";
const PI_API_BASE = process.env.PI_API_BASE || "https://api.minepi.com/v2";

function piRequest(method, apiPath, bodyObj) {
  if (!PI_SERVER_API_KEY) {
    throw new Error("PI_SERVER_API_KEY is not set");
  }

  const url = new URL(PI_API_BASE + apiPath);
  const body = bodyObj ? JSON.stringify(bodyObj) : "";

  const options = {
    method,
    hostname: url.hostname,
    path: url.pathname + url.search,
    headers: {
      Authorization: `Key ${PI_SERVER_API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body)
    }
  };

  return new Promise((resolve, reject) => {
    const r = https.request(options, (resp) => {
      let data = "";
      resp.on("data", (chunk) => (data += chunk));
      resp.on("end", () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          if (resp.statusCode >= 200 && resp.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(JSON.stringify(parsed)));
          }
        } catch {
          reject(new Error(data));
        }
      });
    });
    r.on("error", reject);
    if (body) r.write(body);
    r.end();
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { paymentId } = req.body || {};
  if (!paymentId) {
    return res.status(400).json({ error: "paymentId is required" });
  }

  try {
    const result = await piRequest("POST", `/payments/${encodeURIComponent(paymentId)}/approve`, null);
    res.status(200).json(result);
  } catch (err) {
    res.status(502).json({ error: "Pi API approve failed", message: err.message });
  }
}
