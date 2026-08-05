import { createApp } from "vue";
import { clerkPlugin } from "@clerk/vue";
import { convexVue } from "convex-vue";
import App from "./App.vue";
import router from "./router";
import "./styles.css";

const app = createApp(App);

// Clerk's plugin is only initialized when a public key exists. This lets a fresh checkout show
// a useful configuration screen without pretending that authentication is available.
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
if (clerkPublishableKey) {
  app.use(clerkPlugin, { publishableKey: clerkPublishableKey });
}
const convexUrl = import.meta.env.VITE_CONVEX_URL?.trim();
if (convexUrl) {
  app.use(convexVue, { url: convexUrl });
}

app.use(router);
app.mount("#app");
