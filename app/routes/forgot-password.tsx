import { Link, Form, useActionData } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const form = await request.formData();
  const email = form.get("email")?.toString().trim();

  if (!email) {
    return json({ error: "Email is required." }, { status: 400 });
  }

  try {
    // Call the API endpoint
    const response = await fetch(
      `${process.env.APP_URL || "http://localhost:3000"}/api/forgot-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return json(
        { error: result.error || "Failed to process request." },
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
    console.error("[forgot-password-page] Error:", err);
    return json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
};

export default function ForgotPassword() {
  const actionData = useActionData<typeof action>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (actionData?.success) {
      setSubmitted(true);
      setLoading(false);
    } else if (actionData?.error) {
      setLoading(false);
    }
  }, [actionData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div className="absolute top-6 right-6 text-indigo-600 font-semibold tracking-wider">
        SKYMAX
      </div>

      <Link to="/login" className="absolute top-6 left-6 text-indigo-600 flex items-center gap-1">
        <ArrowLeft size={20} /> Back
      </Link>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="text-center py-6 bg-gradient-to-r from-purple-600 to-pink-500">
            <h2 className="text-white text-lg font-medium">Forgot Password?</h2>
            <p className="text-purple-100 mt-1 font-semibold text-3xl">Reset</p>
          </div>

          {!submitted ? (
            <Form method="post" onSubmit={() => setLoading(true)} className="p-6 space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <div>
                <label className="block text-sm font-medium text-purple-700">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-purple-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-300"
                  required
                />
              </div>

              {actionData?.error && (
                <p className="text-red-600 text-sm">{actionData.error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                aria-busy={loading ? "true" : "false"}
                className="w-full py-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium shadow flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Remember your password?{" "}
                <Link to="/login" className="text-purple-600 font-semibold">
                  Login
                </Link>
              </p>
            </Form>
          ) : (
            <div className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-semibold mb-2">Check your email!</h3>
                <p className="text-green-700 text-sm">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  The link will expire in 1 hour.
                </p>
              </div>

              <p className="text-sm text-gray-600">
                Check your spam or junk folder if you don't see the email in your inbox.
              </p>

              <Link
                to="/login"
                className="block w-full py-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium shadow text-center"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
