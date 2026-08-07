import { clerkPlugin } from "@clerk/vue";
import { convexVue } from "convex-vue";
import type { App } from "vue";
import router from "@/router";

export default (app: App): void => {
  const clerkPublishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  if (clerkPublishableKey) {
    app.use(clerkPlugin, { publishableKey: clerkPublishableKey });
  }

  const convexUrl = import.meta.env.PUBLIC_CONVEX_URL?.trim();
  if (convexUrl) {
    app.use(convexVue, { url: convexUrl });
  }

  app.use(router);
};
