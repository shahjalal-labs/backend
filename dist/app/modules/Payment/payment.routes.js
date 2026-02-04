"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const router = (0, express_1.Router)();
router.post("/create-payment-intent", payment_controller_1.PaymentController.createPaymentIntent);
exports.PaymentRoutes = router;
