<template>
  <AppLayout v-if="authState.isLoaded && authState.isSignedIn">
    <div v-if="loading" class="border border-line bg-surface p-8 text-sm text-muted" role="status">Verificando conexión con Convex…</div>
    <div v-else-if="error" class="border border-red-200 bg-red-50 p-8 text-sm text-red-800" role="alert">
      {{ error }}
    </div>
    <template v-else-if="selectedProject">
      <FileUploader :project-id="selectedProjectId" @uploaded="handleUploaded" />
      <ImageGrid :images="images" :loading="imagesLoading" :error="imagesError" :project-name="selectedProject.name" :save-image="saveImage" />
    </template>
    <div v-else class="grid min-h-80 content-center justify-items-start border border-line bg-surface p-8">
      <p class="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.13em] text-muted">biblioteca vacía</p>
      <h1 class="m-0 font-display text-4xl font-medium tracking-[-0.045em]">
        Elige un proyecto
        <span class="text-coral">.</span>
      </h1>
      <p class="mb-0 mt-3 text-sm text-muted">Crea o selecciona un proyecto en la navegación para empezar.</p>
    </div>
  </AppLayout>
  <section v-else class="mx-auto max-w-2xl py-24" aria-live="polite">
    <p class="eyebrow">verificando acceso</p>
    <h1 class="font-display text-5xl font-semibold">
      Un momento
      <span class="text-coral">.</span>
    </h1>
    <p class="mt-3 text-sm text-muted">Estamos verificando tu sesión antes de abrir la biblioteca privada.</p>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useConvexClient } from "convex-vue";
import AppLayout from "@/layouts/AppLayout.vue";
import FileUploader from "@/components/FileUploader.vue";
import ImageGrid from "@/components/ImageGrid.vue";
import { provideProjectsContext } from "@/composables/useProjectsContext";
import { useImageLibrary } from "@/composables/useImageLibrary";
import { useProjectsWorkspace } from "@/composables/useProjectsWorkspace";
import { authState } from "@/services/auth-state";
import { getAuthenticatedHealth, type AuthenticatedHealth } from '@/services/convex'

const route = useRoute();
const router = useRouter();
const convex = useConvexClient();
const loading = ref(true);
const error = ref<string | null>(null);

const projectsWorkspace = useProjectsWorkspace(convex, route, router)
const imageLibrary = useImageLibrary(convex, projectsWorkspace.selectedProjectId)

const {
  projects,
  projectsLoading,
  projectsError,
  canManageProjects,
  creatingProject,
  createError,
  renamingProject,
  renameError,
  selectedProjectId,
  selectedProject,
  loadProjects,
  selectProject,
  createProject: submitProject,
  renameProject: renameSelectedProject,
} = projectsWorkspace

const { images, imagesLoading, imagesError, handleUploaded, saveImage } = imageLibrary

const health = ref<AuthenticatedHealth | null>(null)

async function load(): Promise<void> {
  try {
    health.value = await getAuthenticatedHealth(convex)
    await loadProjects()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'No se pudo cargar la biblioteca.'
  } finally {
    loading.value = false
  }
}

provideProjectsContext({
  projects,
  projectsLoading,
  projectsError,
  canManageProjects,
  creatingProject,
  createError,
  renamingProject,
  renameError,
  selectedProjectId,
  selectedProject,
  selectProject,
  createProject: submitProject,
  renameProject: renameSelectedProject,
})
watch(
  () => [authState.isLoaded, authState.isSignedIn],
  ([loaded, signedIn]) => {
    if (loaded && signedIn && !health.value) {
      void load()
    }
  },
  { immediate: true },
)
</script>
