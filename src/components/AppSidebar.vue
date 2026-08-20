<template>
  <Sidebar :open="props.open">
    <div class="flex h-full flex-col p-5">
      <div class="flex items-center justify-between pb-6">
        <div class="inline-flex items-center gap-2 font-display text-sm font-semibold">
          <span class="inline-flex h-5 items-end gap-0.5" aria-hidden="true">
            <span class="h-2 w-1 rounded-t-sm bg-blue/50" />
            <span class="h-3.5 w-1 rounded-t-sm bg-blue" />
            <span class="h-5 w-1 rounded-t-sm bg-coral" />
          </span>
          <span>
            cdn
            <span class="text-coral">/</span>
            assets manager
          </span>
        </div>
        <Button class="text-slate-400 md:hidden" variant="ghost" size="icon" aria-label="Cerrar navegación" @click="emit('close')">
          <XIcon :size="16" :stroke-width="1.8" />
        </Button>
      </div>

      <div class="border-l-2 border-coral bg-white/5 px-3 py-3">
        <div v-if="selectedProject">
          <p class="m-0 min-w-0 flex-1 truncate font-display text-base font-medium">
            {{ selectedProject.name }}
          </p>
        </div>
        <p v-else class="m-0 truncate font-display text-base font-medium text-slate-400">Elige un proyecto</p>
      </div>

      <div class="flex min-h-0 flex-1 flex-col gap-3 pt-5">
        <div class="flex items-center justify-between">
          <p class="m-0 font-mono text-[0.62rem] uppercase tracking-[0.13em] text-slate-400">tus proyectos</p>
          <span class="font-mono text-[0.68rem] text-slate-400">{{ filteredProjects.length }}</span>
        </div>
        <div class="relative">
          <SearchIcon class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-400" :size="15" :stroke-width="1.8" aria-hidden="true" />
          <Input
            v-model="projectSearch"
            type="search"
            class="pl-9 bg-white/5 text-white placeholder:text-slate-400 border-blue/50"
            placeholder="Buscar proyectos…"
            aria-label="Buscar proyectos"
          />
        </div>
        <ScrollArea class="min-h-0 flex-1 pr-1 pb-2">
          <div v-if="!filteredProjects.length" class="py-4 text-xs text-slate-400">
            {{ projectSearch ? 'No hay coincidencias.' : 'Todavía no hay proyectos.' }}
          </div>
          <div v-else class="grid gap-1">
            <button
              v-for="project in filteredProjects"
              :key="project._id"
              class="flex w-full items-center gap-2 rounded-md border border-transparent px-3 py-2.5 text-left text-xs text-slate-300 transition hover:bg-sky-700/30 hover:text-white"
              :class="{
                'border-sky-800 bg-sky-500/40 text-white': project._id === selectedProjectId,
              }"
              type="button"
              :ref="(element) => setProjectLink(project._id, element)"
              @click="selectProject(project._id)"
            >
              <span class="size-1.5 shrink-0 rounded-full bg-slate-500" :class="{ 'bg-coral': project._id === selectedProjectId }" aria-hidden="true" />
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
            <Button class="w-fit" type="submit" :disabled="!newProjectName.trim() || creatingProject">
              <PlusIcon :size="16" :stroke-width="1.8" />
            </Button>
          </form>
        </template>
        <p v-if="projectsError || createError" class="m-0 text-[0.7rem] leading-relaxed text-[#ff9b87]" role="alert">
          {{ projectsError || createError }}
        </p>
      </div>
    </div>
  </Sidebar>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { SearchIcon, XIcon, PlusIcon } from 'lucide-vue-next'
import type { Id } from '../../convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sidebar } from '@/components/ui/sidebar'
import { useProjectsContext } from '@/composables/useProjectsContext'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const {
  projects,
  selectedProjectId,
  selectedProject,
  canManageProjects,
  creatingProject,
  projectsError,
  createError,
  selectProject: selectProjectFromContext,
  createProject,
} = useProjectsContext()

const projectSearch = ref('')

const filteredProjects = computed(() => {
  const query = projectSearch.value.trim().toLowerCase()
  if (!query) {
    return projects.value
  }
  return projects.value.filter((project) => project.name.toLowerCase().includes(query))
})

const projectLinks = new Map<Id<'projects'>, HTMLButtonElement>()
const projectToReveal = ref<Id<'projects'> | ''>('')

watch(
  [filteredProjects, projectToReveal],
  async () => {
    const projectId = projectToReveal.value
    if (!projectId) {
      return
    }

    await nextTick()
    projectLinks.get(projectId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  },
  { flush: 'post' },
)

function setProjectLink(projectId: Id<'projects'>, element: Element | ComponentPublicInstance | null): void {
  if (element instanceof HTMLButtonElement) {
    projectLinks.set(projectId, element)
    return
  }
  projectLinks.delete(projectId)
}

function selectProject(projectId: Id<'projects'>): void {
  selectProjectFromContext(projectId)
  emit('close')
}

const newProjectName = ref('')

async function submitProject(): Promise<void> {
  const name = newProjectName.value.trim()
  if (!name || creatingProject.value) {
    return
  }

  const creation = createProject(name)
  projectToReveal.value = selectedProjectId.value
  newProjectName.value = ''

  try {
    await creation
  } finally {
    projectToReveal.value = ''
  }
}
</script>
