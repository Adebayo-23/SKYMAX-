import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { connectDB } from "~/utils/db";
import { getUsername } from "~/utils/session.server";
import User from "~/models/User";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    await connectDB();
    const url = new URL(request.url);
    // Paystack can return `reference` or `trxref` depending on flow — support both.
    const reference = url.searchParams.get('reference') || url.searchParams.get('trxref');
    if (!reference) return json({ error: 'Missing reference/trxref' }, { status: 400 });

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error('[paystack/callback] PAYSTACK_SECRET_KEY missing');
      return json({ error: 'PAYSTACK_SECRET_KEY not configured' }, { status: 500 });
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${secret}` },
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData || !verifyData.status || verifyData.data.status !== 'success') {
      console.error('[paystack/callback] verification failed', { status: verifyRes.status, body: verifyData });
      return json({ error: 'Payment verification failed', details: verifyData }, { status: 400 });
    }

    // Prefer username from session, but fall back to Paystack metadata (useful if cookie not present)
    let username = await getUsername(request);
    if (!username) {
      username = (verifyData.data && verifyData.data.metadata && verifyData.data.metadata.username) || null;
      if (!username) {
        console.error('[paystack/callback] no username in session and no metadata on verify response');
        return json({ error: 'Unable to identify user for this payment' }, { status: 400 });
      }
    }

    // mark user as subscribed
    const user = await User.findOne({ username });
    if (!user) {
      console.error('[paystack/callback] user not found for username', username);
      return json({ error: 'User not found' }, { status: 404 });
    }

    user.isSubscribed = true;
    user.subscriptionId = reference;
    user.trialExpiresAt = null;
    await user.save();

    // Redirect the browser to the app dashboard. Use PUBLIC_ORIGIN so Paystack
    // redirect takes the user back to the correct host/port (e.g. localhost:5173).
    const origin = process.env.PUBLIC_ORIGIN || 'http://localhost:5173';
    return redirect(`${origin}/dashboard`);
  } catch (err) {
    console.error('[paystack/callback] unexpected error', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export default function PaystackCallback() {
  const data = useLoaderData();
  return <div className="p-6">Processing payment...</div>;
}
