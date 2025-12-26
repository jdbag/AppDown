const axios = require('axios');
const PI_API_KEY = process.env.PI_API_KEY;

class AppDownSDK {
  // التحقق من دفع Pi
  static async verifyPiPayment(paymentId) {
    try {
      const response = await axios.get(`https://api.minepi.com/v2/payments/${paymentId}`, {
        headers: { Authorization: `Key ${PI_API_KEY}` }
      });
      const payment = response.data;
      return {
        success: payment.status === 'completed',
        payment
      };
    } catch (err) {
      throw new Error(`Pi API error: ${err.message}`);
    }
  }
}

module.exports = AppDownSDK;
