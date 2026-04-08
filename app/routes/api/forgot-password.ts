import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { connectDB, isDBAvailable } from "~/utils/db";
import User from "~/models/User";
import { generateResetToken, getResetTokenExpiry } from "~/utils/token.server";
import { sendPasswordResetEmail } from "~/utils/email.server";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const action: ActionFunction = async ({ request }) => {
  // Only allow POST requests
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const form = await request.formData();
    const email = form.get("email")?.toString().trim();

    if (!email) {
      return json({ error: "Email is required." }, { status: 400 });
    }

    if (!emailRegex.test(email)) {
      return json({ error: "Invalid email address." }, { status: 400 });
    }

    await connectDB();

    if (!isDBAvailable()) {
      // Development mode without database
      console.warn(
        "⚠️ Database not available. Password reset only works with MongoDB enabled."
      );
      return json(
        {
          error:
            "Password reset is not available in development mode. Please configure MongoDB URI.",
        },
        { status: 503 }
      );
    }

    // Find user by email (case-insensitive)
    const escapeRegex = (s: string) =>
      s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const user = await User.findOne({
      email: { $regex: `^${escapeRegex(email)}$`, $options: "i" },
    }).exec();

    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      console.log("[forgot-password] User not found for email:", email);
      return json(
        {
          success: true,
          message:
            "If an account exists for this email, a password reset link has been sent.",
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpiry = getResetTokenExpiry();

    // Update user with reset token
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      console.error("[forgot-password] Email sending failed:", emailError);
      // Clear the reset token if email fails
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();
      return json(
        { error: "Failed to send password reset email. Please try again." },
        { status: 500 }
      );
    }

    console.log("[forgot-password] Reset token sent to:", email);
    return json(
      {
        success: true,
        message:
          "If an account exists for this email, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[forgot-password] Unexpected error:", err);
    const message =
      err && typeof err === "object" && "message" in err
        ? (err as { message?: unknown }).message
        : "Server error. Please try again.";
    return json(
      {
        error:
          typeof message === "string"
            ? message
            : "Server error. Please try again.",
      },
      { status: 500 }
    );
  }
};
