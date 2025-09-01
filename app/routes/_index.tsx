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
    <div className="container relative">
      {/* Top-left SKYMAX label */}
      <div className="absolute top-4 left-6 text-xl font-bold text-white tracking-wide z-10">
        {data.title}
      </div>

      {/* Centered content */}
      <h1>{data.title}</h1>
      <p>{data.subtitle}</p>
      <div className="buttons">
        <Link to="/signup">
          <button className="signup-btn">Sign Up</button>
        </Link>
        <Link to="/login">
          <button className="login-btn">Login</button>
        </Link>
      </div>
      <div className="advice">
        <p>&quot;Productivity is being able to do things that you were not able to do before.&quot;</p>
        <p>- Franz Kafka</p>
      </div>
    </div>
  );
}
