import { Request, Response } from "express";
import { Team } from "../models/index.js";
import { razorpay } from "../config/razorpay.js";
import crypto from "crypto";
import { env } from "../config/env.js";

const BASE_FEE_PER_PERSON = 50;
const RAZORPAY_FEE_PERCENTAGE = 0.0236; // 2% + 18% GST

/**
 * Creates a Razorpay order for team registration.
 *
 * Pricing logic:
 * 1 team-leader and 1 team-member - 50rs + 50rs × 1 = 100rs
 * 1 team-leader and 2 team-member - 50rs + 50rs × 2 = 150rs
 * 1 team-leader and 3 team-member - 50rs + 50rs × 3 = 200rs
 * 1 team-leader and 4 team-member - 50rs + 50rs × 4 = 250rs
 *
 * Plus Razorpay fees (~2.36%).
 * UPI is the only allowed payment method.
 *
 * @param req - Express Request object containing teamSecret in body.
 * @param res - Express Response object.
 */
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { teamSecret } = req.body;

    if (!teamSecret) {
      return res.status(400).json({ message: "Team secret is required." });
    }

    const team = await Team.findOne({ teamSecret });
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    // Number of additional members (excluding leader)
    const additionalMembersCount = team.teamMembers.length;

    // Base amount: 50 (leader) + 50 * additional members
    const baseAmount =
      BASE_FEE_PER_PERSON + BASE_FEE_PER_PERSON * additionalMembersCount;

    // Add Razorpay fees (2.36%)
    // To ensure we get the baseAmount, we divide by (1 - fee_rate)
    const totalAmount = Math.ceil(baseAmount / (1 - RAZORPAY_FEE_PERCENTAGE));

    const options = {
      amount: totalAmount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
      currency: "INR",
      receipt: `receipt_${team._id}`,
      notes: {
        teamId: team._id.toString(),
        teamName: team.teamName,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save the order ID to the team for later verification
    team.razorpayOrderId = order.id;
    await team.save();

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.razorpayKeyId,
      method: "upi",
      config: {
        display: {
          blocks: { upi: { name: "UPI", instruments: [{ method: "upi" }] } },
          sequence: ["block.upi"],
          preferences: { show_default_blocks: false },
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Verifies the Razorpay payment signature after a successful payment.
 *
 * @param req - Express Request object containing razorpay_order_id, razorpay_payment_id, and razorpay_signature.
 * @param res - Express Response object.
 */
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification details." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", env.razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature verification failed." });
    }

    const updatedTeam = await Team.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { registrationStatus: "PAID" },
      { new: true },
    );

    if (!updatedTeam) {
      return res.status(404).json({ message: "Team not found for this order ID." });
    }

    res.json({
      message: "Payment verified successfully.",
      registrationStatus: updatedTeam.registrationStatus,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
