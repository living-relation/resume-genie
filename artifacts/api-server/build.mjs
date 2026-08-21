import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { rm } from "node:fs/promises";

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Large runtime deps stay on disk so the server bundle stays small enough
 * for Render free (full bundle was ~18MB and OOMed at startup).
 * Smaller deps (zod, etc.) and @workspace/* sources are bundled in.
 */
const EXTERNAL_PACKAGES = [
  "express",
  "cors",
  "cookie-parser",
  "cheerio",
  "docx",
  "mammoth",
  "pdf-parse",
  "multer",
  "openai",
  "drizzle-orm",
  "pg",
  "dotenv",
  "pino",
  "pino-http",
  "pino-pretty",
];

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    sourcemap: false,
    external: [
      ...EXTERNAL_PACKAGES,
      ...EXTERNAL_PACKAGES.map((pkg) => `${pkg}/*`),
    ],
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`,
    },
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
