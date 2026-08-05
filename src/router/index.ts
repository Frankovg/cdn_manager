import { createRouter, createWebHistory } from "vue-router";
import { authState } from "@/services/auth-state";
import SignInView from "@/pages/SignInView.vue";
import WorkbenchView from "@/pages/WorkbenchView.vue";
import NotFoundView from "@/pages/NotFoundView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "workbench", component: WorkbenchView },
    { path: "/sign-in", name: "sign-in", component: SignInView },
    { path: "/workbench", redirect: "/" },
    { path: "/:pathMatch(.*)*", name: "not-found", component: NotFoundView },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to) => {
  if (to.name === "sign-in") return true;
  // AuthGate blocks all content while Clerk resolves the session. The first navigation must
  // complete so Clerk can mount and publish that state; App.vue redirects once it is known.
  if (!authState.isLoaded) return true;
  if (authState.isSignedIn) return true;
  return { name: "sign-in", query: { redirect: to.fullPath } };
});

export default router;
