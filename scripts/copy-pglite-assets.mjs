#!/usr/bin/env node
/**
 * Nitro's Vercel bundle inlines @electric-sql/pglite as
 * `.vercel/output/functions/__server.func/_libs/electric-sql__pglite.mjs`.
 * PGlite then does `new URL("./pglite.data", import.meta.url)` — those
 * sidecar files are not traced. Copy them next to the bundle so serverless
 * (no DATABASE_URL) can boot the DEMO ledger instead of 500ing.
 */
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules/@electric-sql/pglite/dist");
const destDir = join(root, ".vercel/output/functions/__server.func/_libs");

if (!existsSync(destDir)) {
  console.log("[pglite-assets] no Vercel function output — skip");
  process.exit(0);
}

let copied = 0;
for (const name of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
  const src = join(srcDir, name);
  const dest = join(destDir, name);
  if (!existsSync(src)) {
    console.warn(`[pglite-assets] missing ${src}`);
    continue;
  }
  copyFileSync(src, dest);
  copied += 1;
  console.log(`[pglite-assets] copied ${name}`);
}
if (!copied) {
  console.error("[pglite-assets] copied nothing — PGLite serverless will 500");
  process.exit(1);
}
