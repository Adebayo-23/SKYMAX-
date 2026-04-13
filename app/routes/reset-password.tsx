import { Link, Form, useActionData, useSearchParams } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const form = await request.formData();
  const token = form.get("token")?.toString().trim();
  const password = form.get("password")?.toString();
  const confirmPassword = form.get("confirmPassword")?.toString();

  if (!token || !password || !confirmPassword) {
    return json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  try {
    // Call the API endpoint
    const response = await fetch(
      `${process.env.APP_URL || "http://localhost:3000"}/api/reset-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          token,
          password,
          confirmPassword,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return json(
        { error: result.error || "Failed to reset password." },
        { status: response.status }
      );
    }

    return json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[reset-password-page] Error:", err);
    return json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
};

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();

  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Extract token only on client-side to avoid hydration mismatch
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    setToken(tokenFromUrl);
  }, [searchParams]);

  useEffect(() => {
    if (actionData?.error) {
      setLoading(false);
    }
  }, [actionData]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
        <div className="absolute top-6 right-6 text-indigo-600 font-semibold tracking-wider">
          SKYMAX
        </div>

        <Link
          to="/forgot-password"
          className="absolute top-6 left-6 text-indigo-600 flex items-center gap-1"
        >
          <ArrowLeft size={20} /> Back
        </Link>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="text-center py-6 bg-gradient-to-r from-purple-600 to-pink-500">
              <h2 className="text-white text-lg font-medium">Invalid Link</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-semibold mb-2">Invalid Reset Link</h3>
                <p className="text-red-700 text-sm">
                  This password reset link is invalid or has already been used.
                </p>
              </div>

              <Link
                to="/forgot-password"
                className="block w-full py-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium shadow text-center"
              >
                Request New Link
              </Link>

              <Link to="/login" className="block text-center text-purple-600 font-semibold">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div className="absolute top-6 right-6 text-indigo-600 font-semibold tracking-wider">
        SKYMAX
      </div>

      <Link
        to="/forgot-password"
        className="absolute top-6 left-6 text-indigo-600 flex items-center gap-1"
      >
        <ArrowLeft size={20} /> Back
      </Link>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="text-center py-6 bg-gradient-to-r from-purple-600 to-pink-500">
            <h2 className="text-white text-lg font-medium">Create New Password</h2>
            <p className="text-purple-100 mt-1 font-semibold text-3xl">Reset</p>
          </div>

          {actionData?.success ? (
            <div className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-semibold mb-2">Success!</h3>
                <p className="text-green-700 text-sm">
                  Your password has been reset successfully. You can now login with your new password.
                </p>
              </div>

              <Link
                to="/login"
                className="block w-full py-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium shadow text-center"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <Form method="post" onSubmit={() => setLoading(true)} className="p-6 space-y-4">
              <input type="hidden" name="token" value={token} />

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-purple-700">
                  New Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 chars, 1 uppercase, 1 symbol"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full border border-purple-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must contain: at least 8 characters, one uppercase letter, and one symbol
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full border border-purple-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-300"
                  required
                />
              </div>

              {actionData?.error && (
                <p className="text-red-600 text-sm">{actionData.error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                aria-busy={loading ? "true" : "false"}
                className="w-full py-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium shadow flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-purple-600 font-semibold">
                  Back to Login
                </Link>
              </p>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
