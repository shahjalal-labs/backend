import httpStatus from "http-status";
import { stripe } from "../../../helpers/stripe";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

const createPaymentIntent = catchAsync(async (req, res) => {
  const { amount } = req.body;

  /* const paymentIntent = await stripe.paymentIntents.create({
    amount: amount, // smallest unit (e.g. 1000 = $10)
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  }); */

  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1000,
    currency: "usd",
    payment_method_types: ["card"],
  });

  const confirmed = await stripe.paymentIntents.confirm(paymentIntent.id, {
    payment_method: "pm_card_visa", // built-in test card
  });

  console.log(confirmed.status, confirmed); // should be 'succeeded'

  console.log(paymentIntent, "payment.controller.ts", 8);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "success",
    data: {
      clientSecret: paymentIntent.client_secret,
    },
  });
});

export const PaymentController = {
  createPaymentIntent,
};
