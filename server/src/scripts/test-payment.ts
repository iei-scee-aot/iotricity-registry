/**
 * @fileoverview Smoke test for Razorpay integration and payment flow.
 * This script verifies that the server can create Razorpay orders and
 * correctly verify payment signatures.
 */

import mongoose from "mongoose";
import request from "supertest";
import crypto from "crypto";
import { createApp } from "../app.js";
import { closeAuthDatabase, connectToAuthDatabase } from "../config/auth-db.js";
import { connectToDatabase } from "../config/db.js";
import { env } from "../config/env.js";
import { initAuth } from "../lib/auth.js";
import { Team, TeamMember } from "../models/index.js";
import { generateUniqueTeamSecret } from "../helpers/createTeamSecret.js";

/**
 * Main execution function for the payment smoke test.
 */
const run = async (): Promise<void> => {
  await connectToDatabase(env.mongoUri);
  await connectToAuthDatabase(env.mongoUri);
  const app = createApp(initAuth());

  let testTeamMemberId: mongoose.Types.ObjectId | null = null;
  let testTeamId: mongoose.Types.ObjectId | null = null;

  try {
    console.info("Starting Payment Smoke Test...");

    // 1. Create a dummy team member for the test
    const dummyEmail = `test-leader-${Date.now()}@example.com`;
    const teamMember = new TeamMember({
      name: "Test Leader",
      googleEmail: dummyEmail,
      googleProfilePicture: "https://example.com/pic.jpg",
      collegeEmail: `college-${Date.now()}@example.com`,
      rollNumber: `ROLL-${Date.now()}`,
      semester: 1,
      department: "Test Dept",
      phoneNumber: "1234567890",
      readCodeOfConduct: true,
      joinedDiscord: true,
    });
    await teamMember.save();
    testTeamMemberId = teamMember._id as mongoose.Types.ObjectId;
    console.info("✓ Created dummy team member.");

    // 2. Create a dummy team
    const teamSecret = await generateUniqueTeamSecret();
    const team = new Team({
      teamName: "Test Team",
      teamSecret,
      teamLeader: testTeamMemberId,
      registrationStatus: "UNREGISTERED",
    });
    await team.save();
    testTeamId = team._id as mongoose.Types.ObjectId;
    console.info(`✓ Created dummy team with secret: ${teamSecret}`);

    // 3. Test Checkout Session Creation
    console.info("Testing /api/payments/checkout...");
    const checkoutResponse = await request(app)
      .post("/api/payments/checkout")
      .send({ teamSecret });

    if (!checkoutResponse.ok) {
      throw new Error(
        `Checkout failed with status ${checkoutResponse.status}: ${JSON.stringify(checkoutResponse.body)}`,
      );
    }

    const { orderId, amount, currency, keyId } = checkoutResponse.body;
    if (!orderId || !amount) {
      throw new Error("Checkout response missing orderId or amount.");
    }
    console.info(
      `✓ Razorpay Order Created: ${orderId} (Amount: ${amount} ${currency})`,
    );

    // Verify orderId was saved to team
    const updatedTeam = await Team.findById(testTeamId);
    if (updatedTeam?.razorpayOrderId !== orderId) {
      throw new Error("Razorpay Order ID was not saved to the team document.");
    }
    console.info("✓ Order ID correctly persisted to database.");

    // 4. Test Payment Verification (Simulated)
    console.info("Testing /api/payments/verify...");
    const dummyPaymentId = "pay_test_" + Date.now();

    // Generate a valid signature for the dummy payment
    const signatureBody = orderId + "|" + dummyPaymentId;
    const signature = crypto
      .createHmac("sha256", env.razorpayKeySecret)
      .update(signatureBody)
      .digest("hex");

    const verifyResponse = await request(app)
      .post("/api/payments/verify")
      .send({
        razorpay_order_id: orderId,
        razorpay_payment_id: dummyPaymentId,
        razorpay_signature: signature,
      });

    if (!verifyResponse.ok) {
      throw new Error(
        `Verification failed with status ${verifyResponse.status}: ${JSON.stringify(verifyResponse.body)}`,
      );
    }

    if (verifyResponse.body.registrationStatus !== "PAID") {
      throw new Error(
        `Expected status PAID, got ${verifyResponse.body.registrationStatus}`,
      );
    }
    console.info("✓ Payment verified successfully.");

    // Final database check
    const finalTeam = await Team.findById(testTeamId);
    if (finalTeam?.registrationStatus !== "PAID") {
      throw new Error(
        "Team status in database is not PAID after verification.",
      );
    }
    console.info("✓ Team status correctly updated to PAID in database.");

    console.info("\nPayment smoke test passed successfully! 🚀");
  } catch (error: any) {
    console.error("\n❌ Payment smoke test failed:");
    console.error(error.message);
    process.exit(1);
  } finally {
    // Cleanup: Delete test data
    if (testTeamId) await Team.findByIdAndDelete(testTeamId);
    if (testTeamMemberId) await TeamMember.findByIdAndDelete(testTeamMemberId);
    console.info("Cleanup: Removed test data.");

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await closeAuthDatabase();
  }
};

void run();
