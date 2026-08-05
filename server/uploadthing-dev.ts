import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { handleUploadThingRequest } from "./uploadthing.js";

const port = Number.parseInt(process.env.UPLOADTHING_PORT ?? "8787", 10);
const host = process.env.UPLOADTHING_HOST ?? "127.0.0.1";
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function setCors(request: IncomingMessage, response: ServerResponse): void {
  const origin = request.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  }
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, X-CDN-Project-ID, b3, traceparent, x-uploadthing-version, x-uploadthing-package",
  );
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Vary", "Origin");
}

function requestBody(request: IncomingMessage): BodyInit | undefined {
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") {
    return undefined;
  }
  return Readable.toWeb(request) as unknown as ReadableStream<Uint8Array>;
}

async function handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
  setCors(request, response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  if (url.pathname !== "/api/upload" && url.pathname !== "/api/uploadthing") {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  try {
    const headers = new Headers();
    for (const [name, value] of Object.entries(request.headers)) {
      if (value !== undefined) {
        headers.set(name, Array.isArray(value) ? value.join(",") : value);
      }
    }

    const body = requestBody(request);
    const webRequest = new Request(url, {
      method: request.method,
      headers,
      body,
      ...(body ? { duplex: "half" as const } : {}),
    });
    const webResponse = await handleUploadThingRequest(webRequest);

    webResponse.headers.forEach((value: string, name: string) => response.setHeader(name, value));
    response.writeHead(webResponse.status);
    response.end(new Uint8Array(await webResponse.arrayBuffer()));
  } catch (error) {
    const message = error instanceof Error ? error.message : "The upload endpoint failed";
    response.writeHead(500, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: message }));
  }
}

const server = createServer((request, response) => {
  void handle(request, response);
});

server.listen(port, host, () => {
  console.log(`UploadThing server listening at http://${host}:${port}/api/upload`);
});

function shutdown(signal: string): void {
  server.close((error) => {
    if (error) {
      console.error(`${signal} shutdown failed`, error);
      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
