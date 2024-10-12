const Stripe = require("stripe");
const { ErrorHandler } = require("../helpers/error");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  payment = async (amount, email) => {
    try {
      return await stripe.paymentIntents.create({
        amount,
        currency: "INR",
        payment_method_types: ["GPay"],
        receipt_email: email,
      });
    } catch (error) {
      throw new ErrorHandler(error.statusCode, error.message);
    }
  };
}

module.exports = new PaymentService();
