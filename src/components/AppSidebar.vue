<template>
  <Sidebar :open="props.open">
    <div class="flex h-full flex-col p-5">
      <div class="flex items-center justify-between pb-6">
        <div
          class="inline-flex items-center gap-2 font-display text-sm font-semibold"
        >
          <span class="inline-flex h-5 items-end gap-0.5" aria-hidden="true">
            <span class="h-2 w-1 rounded-t-sm bg-blue/50" />
            <span class="h-3.5 w-1 rounded-t-sm bg-blue" />
            <span class="h-5 w-1 rounded-t-sm bg-coral" />
          </span>
          <span>cdn<span class="text-coral">/</span>assets manager</span>
        </div>
        <Button
          class="text-slate-400 md:hidden"
          variant="ghost"
          size="icon"
          aria-label="Cerrar navegación"
          @click="emit('close')"
        >
          <XIcon :size="16" :stroke-width="1.8" />
        </Button>
      </div>

      <div class="border-l-2 border-coral bg-white/5 px-3 py-3">
        <form
          v-if="selectedProject && editingName"
          class="flex items-center gap-2"
          @submit.prevent="submitRename"
        >
          <Input
            ref="renameInput"
            v-model="editedProjectName"
            class="min-w-0 flex-1 bg-transparent border-l-0 border-r-0 border-t-0 border-b rounded-none p-0 text-white ring-0 focus:ring-0 focus:outline-none text-base font-medium"
            maxlength="120"
            aria-label="Nombre del proyecto"
            :disabled="renamingProject"
          />
          <Button
            size="icon"
            type="submit"
            aria-label="Guardar nombre"
            :disabled="!editedProjectName.trim() || renamingProject"
          >
            <SaveIcon :size="15" :stroke-width="1.8" />
          </Button>
        </form>
        <div v-else-if="selectedProject" class="flex items-center gap-2">
          <p
            class="m-0 min-w-0 flex-1 truncate font-display text-base font-medium"
          >
            {{ selectedProject.name }}
          </p>
          <Button
            v-if="canManageProjects"
            class="shrink-0 text-slate-400"
            variant="ghost"
            size="icon"
            type="button"
            aria-label="Editar nombre"
            @click="startRename"
          >
            <PencilIcon :size="15" :stroke-width="1.8" />
          </Button>
        </div>
        <p
          v-else
          class="m-0 truncate font-display text-base font-medium text-slate-400"
        >
          Elige un proyecto
        </p>
        <p
          v-if="renameError"
          class="m-0 mt-2 text-[0.7rem] leading-relaxed text-[#ff9b87]"
          role="alert"
        >
          {{ renameError }}
        </p>
      </div>

      <div class="flex min-h-0 flex-1 flex-col gap-3 pt-5">
        <div class="flex items-center justify-between">
          <p
            class="m-0 font-mono text-[0.62rem] uppercase tracking-[0.13em] text-slate-400"
          >
            tus proyectos
          </p>
          <span class="font-mono text-[0.68rem] text-slate-400">{{
            filteredProjects.length
          }}</span>
        </div>
        <div class="relative">
          <SearchIcon
            class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-400"
            :size="15"
            :stroke-width="1.8"
            aria-hidden="true"
          />
          <Input
            v-model="projectSearch"
            type="search"
            class="pl-9 bg-white/5 text-white placeholder:text-slate-400 border-blue/50"
            placeholder="Buscar proyectos…"
            aria-label="Buscar proyectos"
          />
        </div>
        <ScrollArea class="min-h-0 flex-1 pr-1 pb-2">
          <div v-if="projectsLoading" class="py-4 text-xs text-slate-400">
            Cargando proyectos…
          </div>
          <div
            v-else-if="!filteredProjects.length"
            class="py-4 text-xs text-slate-400"
          >
            {{
              projectSearch
                ? "No hay coincidencias."
                : "Todavía no hay proyectos."
            }}
          </div>
          <div v-else class="grid gap-1">
            <button
              v-for="project in filteredProjects"
              :key="project._id"
              class="flex w-full items-center gap-2 rounded-md border border-transparent px-3 py-2.5 text-left text-xs text-slate-300 transition hover:bg-sky-700/30 hover:text-white"
              :class="{
                'border-sky-800 bg-sky-500/40 text-white':
                  project._id === selectedProjectId,
              }"
              type="button"
              @click="selectProject(project._id)"
            >
              <span
                class="size-1.5 shrink-0 rounded-full bg-slate-500"
                :class="{ 'bg-coral': project._id === selectedProjectId }"
                aria-hidden="true"
              />
              <span class="truncate">{{ project.name }}</span>
            </button>
          </div>
        </ScrollArea>
      </div>

      <div class="grid gap-3 border-t border-slate-400/50 pt-4">
        <template v-if="canManageProjects">
          <form class="gap-2 flex" @submit.prevent="submitProject">
            <Input
              v-model="newProjectName"
              maxlength="120"
              placeholder="Nuevo proyecto"
              :disabled="creatingProject"
              class="bg-white/5 text-white placeholder:text-slate-400 border-blue/50"
            />
            <Button
              class="w-fit"
              type="submit"
              :disabled="!newProjectName.trim() || creatingProject"
            >
              <template v-if="creatingProject">
                <LoaderCircleIcon
                  :size="16"
                  :stroke-width="1.8"
                  class="animate-spin"
                />
              </template>
              <template v-else>
                <PlusIcon :size="16" :stroke-width="1.8" />
              </template>
            </Button>
          </form>
        </template>
        <p
          v-if="projectsError || createError"
          class="m-0 text-[0.7rem] leading-relaxed text-[#ff9b87]"
          role="alert"
        >
          {{ projectsError || createError }}
        </p>
      </div>
    </div>
  </Sidebar>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import {
  PencilIcon,
  SaveIcon,
  SearchIcon,
  XIcon,
  PlusIcon,
  LoaderCircleIcon,
} from "lucide-vue-next";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/ui/sidebar";
import { useProjectsContext } from "@/composables/useProjectsContext";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const {
  projects,
  selectedProjectId,
  selectedProject,
  projectsLoading,
  canManageProjects,
  creatingProject,
  renamingProject,
  projectsError,
  createError,
  renameError,
  selectProject: selectProjectFromContext,
  createProject,
  renameProject,
} = useProjectsContext();

const projectSearch = ref("");
const editingName = ref(false);
const editedProjectName = ref("");

const filteredProjects = computed(() => {
  const query = projectSearch.value.trim().toLowerCase();
  if (!query) {
    return projects.value;
  }
  return projects.value.filter((project) =>
    project.name.toLowerCase().includes(query),
  );
});

watch(
  () => selectedProjectId.value,
  () => {
    editingName.value = false;
    editedProjectName.value = "";
  },
);

watch(
  () => renamingProject.value,
  (renaming, wasRenaming) => {
    if (wasRenaming && !renaming && !renameError.value) {
      editingName.value = false;
      editedProjectName.value = "";
    }
  },
);

function selectProject(projectId: Id<"projects">): void {
  selectProjectFromContext(projectId);
  emit("close");
}

const newProjectName = ref("");

function submitProject(): void {
  const name = newProjectName.value.trim();
  if (!name || creatingProject.value) {
    return;
  }
  void createProject(name);
  newProjectName.value = "";
}

const renameInput = ref<{ $el?: HTMLElement } | null>(null);

async function startRename(): Promise<void> {
  if (!selectedProject.value?.name || !canManageProjects.value) {
    return;
  }
  editedProjectName.value = selectedProject.value.name;
  editingName.value = true;
  await nextTick();
  const el = renameInput.value?.$el;
  if (el instanceof HTMLInputElement) {
    el.focus();
    el.select();
  }
}

function submitRename(): void {
  const name = editedProjectName.value.trim();
  if (!name || renamingProject.value) {
    return;
  }
  void renameProject(name);
}
</script>
