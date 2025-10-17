import { createCookieSessionStorage, redirect } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET ?? "dev-secret";

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getUserSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return getSession(cookie);
}

export async function getUsername(request: Request) {
  const session = await getUserSession(request);
  const username = session.get("username");
  return typeof username === "string" ? username : null;
}

// Export commitSession so route actions can set flashes and include Set-Cookie in responses
export { getSession, commitSession };

export async function requireUser(request: Request) {
  const username = await getUsername(request);
  if (!username) throw redirect("/login");
  return username;
}

export async function createUserSession(username: string, redirectTo = "/") {
  const session = await getSession();
  session.set("username", username);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function destroyUserSession(request: Request, redirectTo = "/") {
  const session = await getUserSession(request);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}