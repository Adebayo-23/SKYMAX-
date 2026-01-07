import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { getUsername } from "~/utils/session.server";
import { connectDB } from "~/utils/db";
import User from "~/models/User";
import { Form, useActionData, useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
  await connectDB();
  const username = await getUsername(request);
  if (!username) return redirect('/login');
  const user = await User.findOne({ username }).lean();
  if (!user) return json({ error: 'User not found' }, { status: 404 });
  return json({ email: user.email, username: user.username });
};

// Action will initialize a Paystack transaction and redirect the user to authorization_url
export const action: ActionFunction = async ({ request }) => {
  await connectDB();
  const username = await getUsername(request);
  if (!username) return redirect('/login');

  const form = await request.formData();
  const amountNaira = Number(form.get('amount') || 1000); // default NGN 1000

  const user = await User.findOne({ username });
  if (!user) return json({ error: 'User not found' }, { status: 404 });

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return json({ error: 'PAYSTACK_SECRET_KEY not configured' }, { status: 500 });

  // Default callback origin when PUBLIC_ORIGIN not set
  const callbackBase = process.env.PUBLIC_ORIGIN || 'http://localhost:5173';

  // Paystack expects amount in kobo (NGN * 100)
  const payload = {
    email: user.email,
    amount: Math.round(amountNaira * 100),
    metadata: { username: user.username, purpose: 'subscription' },
    callback_url: `${callbackBase}/paystack/callback`,
  };

  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data || !data.status) {
    return json({ error: 'Failed to initialize Paystack transaction', details: data }, { status: 500 });
  }

  const { authorization_url, reference } = data.data || {};
  if (!authorization_url) return json({ error: 'No authorization_url returned' }, { status: 500 });

  // Store reference temporarily on user record (optional)
  user.subscriptionId = reference;
  await user.save();

  // Redirect user to Paystack checkout page
  return redirect(authorization_url);
};

export default function Subscribe() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Subscribe (Test mode)</h2>
        <p className="text-sm text-gray-600 mb-4">You have a 30-day free trial. Subscribing will start your paid plan after the trial.</p>
        {actionData?.error && <p className="text-red-600">{String(actionData.error)}</p>}
        <Form method="post">
          <label className="block text-sm font-medium">Amount (NGN)</label>
          <input name="amount" defaultValue={1000} className="mt-1 block w-full border rounded px-3 py-2" />
          <button className="mt-4 w-full bg-purple-600 text-white py-2 rounded">Pay with Paystack (Test)</button>
        </Form>
      </div>
    </div>
  );
}
