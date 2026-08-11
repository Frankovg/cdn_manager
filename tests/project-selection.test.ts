import { describe, expect, it } from 'vitest'
import { readProjectId, resolveProjectId } from '../src/composables/useProjectsWorkspace'
import type { Project } from '../src/services/convex'

const projects = [
  { _id: 'project-1', name: 'Uno' },
  { _id: 'project-2', name: 'Dos' },
] as Project[]

describe('project selection', () => {
  it('reads a trimmed project id from the query', () => {
    expect(readProjectId({ project: ' project-2 ' })).toBe('project-2')
  })

  it('falls back to the first project when the query is missing or invalid', () => {
    expect(resolveProjectId(projects, {})).toBe('project-1')
    expect(resolveProjectId(projects, { project: 'unknown' })).toBe('project-1')
  })

  it('keeps a valid project from the query', () => {
    expect(resolveProjectId(projects, { project: 'project-2' })).toBe('project-2')
  })

  it('returns no selection when there are no projects', () => {
    expect(resolveProjectId([], { project: 'project-2' })).toBe('')
  })
})
