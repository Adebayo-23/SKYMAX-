import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";

export const loader: LoaderFunction = async () => {
  return json({
    title: "SKYMAX",
    subtitle: "Manage Your Schedule Smartly",
  });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="w-full bg-gradient-to-b from-purple-800 via-purple-900 to-black text-white py-24">
        <div className="container mx-auto px-4 text-center relative">
          <div className="absolute top-6 left-6 text-sm font-semibold tracking-widest opacity-90">
            {data.title}
          </div>

          <h2 className="text-sm uppercase tracking-widest mb-4">{data.title}</h2>
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6">{data.title}</h1>
          <p className="text-xl md:text-2xl mb-8">{data.subtitle}</p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/signup" className="inline-block">
              <button className="px-6 py-3 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-md">Sign Up</button>
            </Link>
            <Link to="/login" className="inline-block">
              <button className="px-6 py-3 rounded-md bg-pink-500 hover:bg-pink-600 text-white font-medium shadow-md">Login</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quote area */}
      <section className="w-full bg-gradient-to-t from-gray-100 via-gray-300 to-black/0 py-20 flex items-center">
        <div className="container mx-auto px-4 text-center">
          <p className="text-2xl md:text-3xl italic text-gray-700 max-w-3xl mx-auto mb-6">"Productivity is being able to do things that you were not able to do before."</p>
          <p className="text-lg text-gray-600">- Franz Kafka</p>
        </div>
      </section>
    </main>
  );
}
