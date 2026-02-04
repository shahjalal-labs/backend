import { Router } from "express";
import { PaymentController } from "./payment.controller";

const router = Router();

router.post("/create-payment-intent", PaymentController.createPaymentIntent);

export const PaymentRoutes = router;
