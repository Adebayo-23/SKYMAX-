import { createRequestHandler } from "@remix-run/netlify";
import * as build from "../../build/server/index.js";

// The build export may be typed with a different @remix-run package instance
// in the local node_modules tree which can cause TypeScript to complain when
// mixing types from different copies of @remix-run packages. Cast to `any`
// here to avoid duplicate-type incompatibilities in the Netlify function.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const typedBuild = build as unknown as any;

export const handler = createRequestHandler({
  build: typedBuild,
  getLoadContext() {
    return {};
  },
});
