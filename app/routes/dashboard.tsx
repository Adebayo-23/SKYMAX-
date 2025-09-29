import React from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getUsername } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const username = await getUsername(request);
  if (!username) return redirect("/login");
  return json({ username });
};

export default function Dashboard() {
  const data = useLoaderData<{ username: string }>();
  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <p>
        Welcome, <strong>{data.username}</strong>!
      </p>
      <Link to="/">Home</Link>
    </div>
  );
}
