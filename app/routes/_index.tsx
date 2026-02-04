import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { connectDB } from "~/utils/db";
import { getUsername } from "~/utils/session.server";
import User from "~/models/User";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await connectDB();

  const username = await getUsername(request);
  let trialDaysLeft: number | null = null;

  if (username) {
    const u = await User.findOne({ username }).lean<{
      trialExpiresAt?: Date;
    }>();

    if (u?.trialExpiresAt) {
      const expires = new Date(u.trialExpiresAt).getTime();
      const now = Date.now();
      const diff = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
      trialDaysLeft = diff > 0 ? diff : 0;
    }
  }

  return json({
    title: "SKYMAX",
    subtitle: "Manage Your Schedule Smartly",
    trialDaysLeft,
  });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="w-full bg-gradient-to-b from-purple-800 via-purple-900 to-black text-white min-h-[70vh] flex items-center py-24">
        <div className="container mx-auto px-4 text-center relative">
          <div className="absolute top-8 left-8 text-sm font-semibold tracking-widest text-white/90">
            {data.title}
          </div>

          <h2 className="text-sm uppercase tracking-widest mb-4">{data.title}</h2>
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-extrabold mb-6 leading-tight">{data.title}</h1>
          <p className="text-lg md:text-2xl mb-10 text-white/90">{data.subtitle}</p>

          <div className="flex items-center justify-center gap-6 mt-2">
            <Link to="/signup" className="inline-block">
              <button className="px-8 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg">Sign Up</button>
            </Link>
            <Link to="/login" className="inline-block">
              <button className="px-8 py-3 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-medium shadow-lg">Login</button>
            </Link>
          </div>
          {data.trialDaysLeft !== null ? (
            <div className="mt-6 text-sm text-yellow-100">
              You have <strong>{data.trialDaysLeft}</strong> day(s) left in your free trial. <Link to="/subscribe" className="underline font-semibold">Subscribe now</Link> to continue uninterrupted.
            </div>
          ) : (
            <div className="mt-6 text-sm text-white/90">
              New here? Enjoy a <strong>30-day free trial</strong> when you sign up. <Link to="/signup" className="underline font-semibold">Create an account</Link> to get started.
            </div>
          )}
        </div>
      </section>

      {/* Quote area */}
      <section className="w-full bg-gradient-to-t from-gray-100 via-gray-300 to-black/0 py-20 flex items-center">
        <div className="container mx-auto px-4 text-center">
          <p className="text-2xl md:text-3xl italic text-gray-700 max-w-3xl mx-auto mb-6">&quot;Productivity is being able to do things that you were not able to do before."</p>
          <p className="text-lg text-gray-600">- Franz Kafka</p>
        </div>
      </section>
    </main>
  );
}
