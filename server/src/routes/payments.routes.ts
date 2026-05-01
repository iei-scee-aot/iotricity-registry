import { Router } from "express";
import {
  createCheckoutSession,
  verifyPayment,
} from "../controllers/payments.controller.js";

export const paymentRouter = Router();

/**
 * @openapi
 * /api/payments/checkout:
 *   post:
 *     summary: Create a Razorpay checkout session
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamSecret
 *             properties:
 *               teamSecret:
 *                 type: string
 *     responses:
 *       200:
 *         description: Checkout session created
 *       404:
 *         description: Team not found
 *       500:
 *         description: Server error
 */
paymentRouter.post("/checkout", createCheckoutSession);

/**
 * @openapi
 * /api/payments/verify:
 *   post:
 *     summary: Verify Razorpay payment signature
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified
 *       400:
 *         description: Invalid signature
 *       404:
 *         description: Team not found
 *       500:
 *         description: Server error
 */
paymentRouter.post("/verify", verifyPayment);

export default paymentRouter;
