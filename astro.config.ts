import node from "@astrojs/node";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import sentry from "@sentry/astro";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [
    vue({ appEntrypoint: "/src/astro-vue-app" }),
    sentry({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "altipla",
      project: "altipla-node-backends",
      telemetry: false,
      enabled: {
        client: false,
        server: true,
      },
    }),
  ],
  server: { host: true },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});
