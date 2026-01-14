#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const buildClientDir = path.join(process.cwd(), "build", "client");
const assetsDir = path.join(buildClientDir, "assets");

if (!fs.existsSync(buildClientDir) || !fs.existsSync(assetsDir)) {
  console.error("build/client or build/client/assets not found. Run the Remix build first.");
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const cssFiles = files.filter(f => f.endsWith(".css"));
const jsFiles = files.filter(f => f.endsWith(".js"));

// Prefer including manifest, entry.client and index bundles first if present
const preferOrder = [f => f.startsWith("manifest"), f => f.startsWith("entry.client"), f => f.startsWith("index")];
const orderedJs = [];
const remainingJs = jsFiles.slice();
preferOrder.forEach(pred => {
  const idx = remainingJs.findIndex(pred);
  if (idx !== -1) orderedJs.push(remainingJs.splice(idx, 1)[0]);
});
orderedJs.push(...remainingJs);

const links = cssFiles.map(f => `  <link rel="stylesheet" href="assets/${f}">`).join("\n");
const scripts = orderedJs.map(f => `  <script type="module" src="assets/${f}" defer></script>`).join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>My Todo App</title>
${links}
</head>
<body>
  <div id="root"></div>
${scripts}
</body>
</html>`;

const outPath = path.join(buildClientDir, "index.html");
fs.writeFileSync(outPath, html, "utf8");
console.log(`Wrote ${outPath}`);

const redirectsSrc = path.join(process.cwd(), "public", "_redirects");
const redirectsDest = path.join(buildClientDir, "_redirects");
if (fs.existsSync(redirectsSrc)) {
  fs.copyFileSync(redirectsSrc, redirectsDest);
  console.log(`Copied _redirects to ${redirectsDest}`);
} else {
  console.warn("public/_redirects not found; ensure SPA redirect is present in deploy.");
}

process.exit(0);
