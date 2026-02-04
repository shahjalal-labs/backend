"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const stripe_1 = require("../../../helpers/stripe");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const createPaymentIntent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount } = req.body;
    /* const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // smallest unit (e.g. 1000 = $10)
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    }); */
    const paymentIntent = yield stripe_1.stripe.paymentIntents.create({
        amount: 1000,
        currency: "usd",
        payment_method_types: ["card"],
    });
    const confirmed = yield stripe_1.stripe.paymentIntents.confirm(paymentIntent.id, {
        payment_method: "pm_card_visa", // built-in test card
    });
    console.log(confirmed.status, confirmed); // should be 'succeeded'
    console.log(paymentIntent, "payment.controller.ts", 8);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "success",
        data: {
            clientSecret: paymentIntent.client_secret,
        },
    });
}));
exports.PaymentController = {
    createPaymentIntent,
};
