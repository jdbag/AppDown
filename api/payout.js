// api/payout.js
// "App → User" payment: your app sends Pi to a user's wallet.
// This is the flow required by Pi's "Develop" form (App to User transactions
// to unique wallets) before a Mainnet app wallet is approved.
//
// Flow: 1) create the payment on Pi's servers  2) submit the Stellar
// transaction from your app wallet  3) tell Pi's servers it's complete.
//
// Call this endpoint yourself (e.g. from an admin page, a script, or curl)
// once per test — with a different Pi `uid` each time — until you've paid
// out to 5 unique wallets on Testnet.
//
// Required env vars (set in Vercel > Environment Variables):
//   PI_API_KEY        - your app's Pi Platform API key
//   APP_WALLET_SEED    - the secret seed ("S...") of your app's Pi wallet
//   PI_NETWORK         - "testnet" or "mainnet" (defaults to "testnet")
//
// Required dependency (add to package.json): "stellar-sdk"

const StellarSdk = require("stellar-sdk");

const PI_API_BASE = "https://api.minepi.com/v2";
const PI_API_KEY = process.env.PI_API_KEY;
const APP_WALLET_SEED = process.env.APP_WALLET_SEED;
const NETWORK = process.env.PI_NETWORK || "testnet";

const HORIZON_URL =
  NETWORK === "mainnet"
    ? "https://api.mainnet.minepi.com"
    : "https://api.testnet.minepi.com";
const NETWORK_PASSPHRASE = "Pi Network";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { uid, amount, memo } = req.body || {};
    if (!uid || !amount) {
      return res.status(400).json({ error: "uid and amount are required" });
    }
    if (!PI_API_KEY || !APP_WALLET_SEED) {
      return res
        .status(500)
        .json({ error: "PI_API_KEY / APP_WALLET_SEED not configured on server" });
    }

    // 1) Create the payment on Pi's servers.
    const createResp = await fetch(`${PI_API_BASE}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment: {
          amount: Number(amount),
          memo: memo || "App to User payout",
          metadata: { reason: "payout" },
          uid, // the recipient's Pi uid, obtained from Pi.authenticate() on your app
        },
      }),
    });

    if (!createResp.ok) {
      const text = await createResp.text();
      return res.status(createResp.status).json({ error: "Pi API create payment failed", details: text });
    }

    const payment = await createResp.json();
    const paymentId = payment.identifier;
    const recipientAddress = payment.to_address || payment.recipient;

    if (!paymentId || !recipientAddress) {
      return res.status(500).json({ error: "Unexpected response from Pi API", payment });
    }

    // 2) Submit the Stellar (Pi blockchain) transaction from your app wallet.
    const server = new StellarSdk.Server(HORIZON_URL);
    const keypair = StellarSdk.Keypair.fromSecret(APP_WALLET_SEED);
    const account = await server.loadAccount(keypair.publicKey());
    const baseFee = await server.fetchBaseFee();

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: baseFee.toString(),
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: recipientAddress,
          asset: StellarSdk.Asset.native(),
          amount: Number(amount).toFixed(7),
        })
      )
      .addMemo(StellarSdk.Memo.text(paymentId))
      .setTimeout(30)
      .build();

    transaction.sign(keypair);
    const submitResult = await server.submitTransaction(transaction);
    const txid = submitResult.hash;

    // 3) Tell Pi's servers the payment is complete.
    const completeResp = await fetch(`${PI_API_BASE}/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid }),
    });

    if (!completeResp.ok) {
      const text = await completeResp.text();
      return res.status(completeResp.status).json({ error: "Pi API complete failed", details: text, txid });
    }

    const completed = await completeResp.json();
    return res.status(200).json({ message: `Paid out to ${uid}`, paymentId, txid, payment: completed });
  } catch (err) {
    console.error("payout error:", err);
    return res.status(500).json({ error: "Internal server error", details: String(err) });
  }
};
