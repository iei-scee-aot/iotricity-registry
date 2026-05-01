import Razorpay from "razorpay";
import { env } from "./env.js";

/**
 * Initializes the Razorpay instance with the provided API keys.
 */
export const razorpay = new Razorpay({
  key_id: env.razorpayKeyId,
  key_secret: env.razorpayKeySecret,
});
