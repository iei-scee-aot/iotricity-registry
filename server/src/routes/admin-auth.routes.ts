import { Router } from "express";
import { env } from "../config/env.js";

export const adminAuthRouter = Router();

adminAuthRouter.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === env.adminUsername && password === env.adminPassword) {
    // In a real app, you'd return a JWT. For this simple setup, we'll just return a success message.
    // The admin app will store these credentials or a "session" flag.
    return res.status(200).json({ message: "Login successful", admin: true });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});
