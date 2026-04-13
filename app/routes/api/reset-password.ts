import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { connectDB, isDBAvailable } from "~/utils/db";
import User from "~/models/User";
import { isTokenValid } from "~/utils/token.server";
import { sendPasswordResetSuccessEmail } from "~/utils/email.server";
import { hashPassword } from "~/utils/password.server";

const passwordRegex =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

export const action: ActionFunction = async ({ request }) => {
  // Only allow POST requests
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const form = await request.formData();
    const token = form.get("token")?.toString().trim();
    const newPassword = form.get("password")?.toString();
    const confirmPassword = form.get("confirmPassword")?.toString();

    if (!token || !newPassword || !confirmPassword) {
      return json(
        { error: "Token and passwords are required." },
        { status: 400 }
      );
    }

    if (!passwordRegex.test(newPassword)) {
      return json(
        {
          error:
            "Password must be at least 8 characters, start with a capital letter, and contain symbols or punctuation",
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    await connectDB();

    if (!isDBAvailable()) {
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

    // Find user with matching reset token
    const user = await User.findOne({
      resetToken: token,
    }).exec();

    if (!user) {
      console.log("[reset-password] Invalid token");
      return json(
        { error: "Invalid or expired password reset link." },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (!isTokenValid(user.resetTokenExpiry)) {
      console.log("[reset-password] Token expired for user:", user.username);
      // Clear expired token
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();
      return json(
        {
          error:
            "Password reset link has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Hash new password before saving
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    // Send success email notification
    try {
      await sendPasswordResetSuccessEmail(user.email);
    } catch (emailError) {
      console.error("[reset-password] Failed to send success email:", emailError);
      // Don't fail the password reset if success email fails
    }

    console.log("[reset-password] Password reset successful for user:", user.username);
    return json(
      {
        success: true,
        message: "Password has been reset successfully. You can now login.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[reset-password] Unexpected error:", err);
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
