import { clerkPlugin } from "@clerk/vue";
import { convexVue } from "convex-vue";
import {
  PUBLIC_CLERK_PUBLISHABLE_KEY,
  PUBLIC_CONVEX_URL,
} from "astro:env/client";
import type { App } from "vue";
import router from "@/router";

export default (app: App): void => {
  app.use(clerkPlugin, { publishableKey: PUBLIC_CLERK_PUBLISHABLE_KEY });

  app.use(convexVue, { url: PUBLIC_CONVEX_URL });

  app.use(router);
};
