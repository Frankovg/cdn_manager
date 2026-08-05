<template>
  <AuthGate>
    <div class="min-h-screen">
      <main class="w-full">
        <RouterView />
      </main>
    </div>
  </AuthGate>
  <Toaster position="bottom-right" />
</template>

<script setup lang="ts">
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import "vue-sonner/style.css";
import AuthGate from "@/components/AuthGate.vue";
import { Toaster } from "@/components/ui/sonner";
import { authState } from "@/services/auth-state";

const route = useRoute();
const router = useRouter();

watch(
  () => [authState.isLoaded, authState.isSignedIn, route.name],
  ([loaded, signedIn, name]) => {
    if (loaded && !signedIn && name !== "sign-in") {
      void router.replace({
        name: "sign-in",
        query: { redirect: route.fullPath },
      });
    }
  },
);
</script>
