import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { ConvexClient } from 'convex/browser'
import type { LocationQuery, RouteLocationNormalizedLoaded, Router } from 'vue-router'
import type { Id } from '../../convex/_generated/dataModel'
import { toast } from 'vue-sonner'
import { createProject, getProjectsManagementPermission, renameProject, subscribeProjects, type Project } from '@/services/convex'

export function readProjectId(query: LocationQuery): Id<'projects'> | '' {
  const raw = query.project
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim() as Id<'projects'>
  }
  return ''
}

export function resolveProjectId(projects: Project[], query: LocationQuery): Id<'projects'> | '' {
  const fromQuery = readProjectId(query)
  if (fromQuery && projects.some((project) => project._id === fromQuery)) {
    return fromQuery
  }
  return projects[0]?._id ?? ''
}

interface ProjectsWorkspace {
  projects: Ref<Project[]>
  projectsLoading: Ref<boolean>
  projectsError: Ref<string | null>
  canManageProjects: Ref<boolean>
  creatingProject: Ref<boolean>
  createError: Ref<string | null>
  renamingProject: Ref<boolean>
  renameError: Ref<string | null>
  selectedProjectId: Ref<Id<'projects'> | ''>
  selectedProject: ComputedRef<Project | null>
  loadProjects: () => Promise<void>
  selectProject: (projectId: Id<'projects'>) => void
  createProject: (name: string) => Promise<void>
  renameProject: (name: string) => Promise<void>
}

function getErrorMessage(reason: unknown, fallback: string): string {
  return reason instanceof Error ? reason.message : fallback
}

export function useProjectsWorkspace(convex: ConvexClient | null, route: RouteLocationNormalizedLoaded, router: Router): ProjectsWorkspace {
  const projects = ref<Project[]>([])
  const projectsLoading = ref(false)
  const projectsError = ref<string | null>(null)
  const canManageProjects = ref(false)
  const selectedProjectId = ref<Id<'projects'> | ''>('')
  const creatingProject = ref(false)
  const createError = ref<string | null>(null)
  const renamingProject = ref(false)
  const renameError = ref<string | null>(null)
  let unsubscribeProjects: (() => void) | null = null

  function stopProjectsSubscription(): void {
    if (!unsubscribeProjects) {
      return
    }
    const unsubscribe = unsubscribeProjects
    unsubscribeProjects = null
    unsubscribe()
  }

  const selectedProject = computed(() => projects.value.find((project) => project._id === selectedProjectId.value) ?? null)

  function writeProjectIdToQuery(projectId: Id<'projects'> | ''): void {
    const current = route.query.project
    const nextValue = projectId || undefined

    if (typeof current === 'string' && current === nextValue) {
      return
    }
    if (!current && !nextValue) {
      return
    }

    const query: LocationQuery = { ...route.query }
    if (nextValue) {
      query.project = nextValue
    } else {
      delete query.project
    }
    void router.replace({ query })
  }

  async function loadProjects(): Promise<void> {
    if (!convex) {
      return
    }

    projectsLoading.value = true
    projectsError.value = null
    stopProjectsSubscription()

    try {
      let hasReceivedProjects = false
      const projectsReady = new Promise<void>((resolve, reject) => {
        const subscription = subscribeProjects(
          convex,
          (loadedProjects) => {
            projects.value = loadedProjects
            if (!hasReceivedProjects) {
              hasReceivedProjects = true
              selectedProjectId.value = resolveProjectId(loadedProjects, route.query)
              resolve()
            }
          },
          reject,
        )
        unsubscribeProjects = () => subscription()
      })
      const permission = await getProjectsManagementPermission(convex)
      await projectsReady
      canManageProjects.value = permission
    } catch (reason) {
      stopProjectsSubscription()
      projectsError.value = getErrorMessage(reason, 'No se pudo cargar la biblioteca.')
      throw reason
    } finally {
      projectsLoading.value = false
    }
  }

  function selectProject(projectId: Id<'projects'>): void {
    selectedProjectId.value = projectId
    renameError.value = null
  }

  async function submitProject(name: string): Promise<void> {
    if (!convex || !name.trim() || creatingProject.value) {
      return
    }

    creatingProject.value = true
    createError.value = null
    const optimisticProjectId = `optimistic-project-${Date.now()}-${Math.random()}` as Id<'projects'>
    selectedProjectId.value = optimisticProjectId

    try {
      const id = await createProject(convex, name, optimisticProjectId)
      selectedProjectId.value = id
      toast.success('Proyecto creado', { duration: 2500 })
    } catch (reason) {
      createError.value = getErrorMessage(reason, 'No se pudo crear el proyecto.')
      projects.value = projects.value.filter((project) => project._id !== optimisticProjectId)
      selectedProjectId.value = projects.value[0]?._id ?? ''
      toast.error(createError.value, { duration: 3500 })
    } finally {
      creatingProject.value = false
    }
  }

  async function renameSelectedProject(name: string): Promise<void> {
    if (!convex || !selectedProjectId.value || !name.trim() || renamingProject.value) {
      return
    }

    renamingProject.value = true
    renameError.value = null

    try {
      await renameProject(convex, selectedProjectId.value, name)
      await loadProjects()
      toast.success('Proyecto renombrado', { duration: 2500 })
    } catch (reason) {
      renameError.value = getErrorMessage(reason, 'No se pudo renombrar el proyecto.')
      toast.error(renameError.value, { duration: 3500 })
    } finally {
      renamingProject.value = false
    }
  }

  watch(selectedProjectId, (projectId) => {
    writeProjectIdToQuery(projectId)
  })

  watch(
    () => route.query.project,
    () => {
      if (!projects.value.length || creatingProject.value) {
        return
      }
      const resolved = resolveProjectId(projects.value, route.query)
      if (resolved !== selectedProjectId.value) {
        selectedProjectId.value = resolved
      }
    },
  )

  return {
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
  }
}
