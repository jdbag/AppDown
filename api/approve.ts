export default async function handler(req, res) {
  return res.status(200).json({
    success: true,
    envKey: process.env.PI_API_KEY || "undefined"
  });
}
