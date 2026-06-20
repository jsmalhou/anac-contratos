import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";

const app = new Hono();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

// Serve static assets and SPA fallback
app.all("*", async (c) => {
  const url = new URL(c.req.url);
  const path = url.pathname;

  // Try to serve the requested file from assets
  try {
    const assetPath = path === "/" ? "/index.html" : path;
    const asset = await import("__STATIC_CONTENT_MANIFEST").then(
      (m) => m.default || m
    );
    const manifest = JSON.parse(asset);
    const fileKey = manifest[assetPath.slice(1)] || assetPath.slice(1);

    if (fileKey) {
      const object = await c.env.__STATIC_CONTENT.get(fileKey);
      if (object) {
        const contentType = getContentType(assetPath);
        return new Response(object, {
          headers: { "Content-Type": contentType },
        });
      }
    }
  } catch {
    // ignore
  }

  // Fallback to index.html for SPA routing
  try {
    const asset = await import("__STATIC_CONTENT_MANIFEST").then(
      (m) => m.default || m
    );
    const manifest = JSON.parse(asset);
    const indexKey = manifest["index.html"] || "index.html";
    const indexHtml = await c.env.__STATIC_CONTENT.get(indexKey);
    if (indexHtml) {
      return new Response(indexHtml, {
        headers: { "Content-Type": "text/html" },
      });
    }
  } catch {
    // ignore
  }

  return c.json({ error: "Not Found" }, 404);
});

function getContentType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    html: "text/html",
    js: "application/javascript",
    css: "text/css",
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    woff2: "font/woff2",
    woff: "font/woff",
    ttf: "font/ttf",
  };
  return types[ext || ""] || "application/octet-stream";
}

export default app;
