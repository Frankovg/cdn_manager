import { inject, provide, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import type { Id } from '../../convex/_generated/dataModel'
import type { Project } from '@/services/convex'

interface ProjectsContext {
  projects: Ref<Project[]>
  projectsLoading: Ref<boolean>
  projectsError: Ref<string | null>
  canManageProjects: Ref<boolean>
  creatingProject: Ref<boolean>
  createError: Ref<string | null>
  selectedProjectId: Ref<Id<'projects'> | ''>
  selectedProject: ComputedRef<Project | null>
  selectProject: (projectId: Id<'projects'>) => void
  createProject: (name: string) => Promise<void>
}

const projectsContextKey: InjectionKey<ProjectsContext> = Symbol('projects')

export function provideProjectsContext(context: ProjectsContext): void {
  provide(projectsContextKey, context)
}

export function useProjectsContext(): ProjectsContext {
  const context = inject(projectsContextKey)
  if (!context) {
    throw new Error('Projects context is not available.')
  }
  return context
}
