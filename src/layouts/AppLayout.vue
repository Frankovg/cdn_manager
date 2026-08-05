<template>
  <section class="flex min-h-screen bg-paper">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex w-full flex-col">
      <AppNav @open-sidebar="sidebarOpen = true" />

      <main class="w-full max-w-[100rem] px-4 pb-20 md:mx-auto md:px-10">
        <div class="min-w-0">
          <slot />
        </div>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AppNav from "@/components/AppNav.vue";
import AppSidebar from "@/components/AppSidebar.vue";

const sidebarOpen = ref(false);
</script>
