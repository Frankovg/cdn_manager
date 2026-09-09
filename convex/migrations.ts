import { Migrations } from '@convex-dev/migrations'
import type { Id } from './_generated/dataModel'
import { components } from './_generated/api'
import { internalMutation } from './_generated/server'
import schema from './schema'

export const migrations = new Migrations(components.migrations, { schema })

export const run = migrations.runner()

const TARGET_PROJECT_ID = 'j97d1ty8nrnz3q577y6ad8078x8dpegf' as Id<'projects'>
const UPLOADED_FROM_MS = Date.parse('2026-09-09T00:00:00+02:00')
const UPLOADED_BEFORE_MS = Date.parse('2026-09-09T11:00:00+02:00')

/** One-off: move images uploaded on 2026-09-09 before 11:00 (UTC+2). */
export const moveImagesToProject = internalMutation({
  args: {},
  handler: async (ctx) => {
    const project = await ctx.db.get(TARGET_PROJECT_ID)
    if (!project) {
      throw new Error(`The project does not exist: ${TARGET_PROJECT_ID}`)
    }

    const imagesFromWindow = await ctx.db
      .query('images')
      .withIndex('by_creation_time', (query) => query.gte('_creationTime', UPLOADED_FROM_MS).lt('_creationTime', UPLOADED_BEFORE_MS))
      .collect()

    const uploadedInWindow = imagesFromWindow.filter((image) => image.uploadedAt >= UPLOADED_FROM_MS && image.uploadedAt < UPLOADED_BEFORE_MS)
    if (!uploadedInWindow.length) {
      throw new Error('no images found for uploadedAt 2026-09-09 before 11:00')
    }

    const movedIds: Id<'images'>[] = []
    const alreadyInProjectIds: Id<'images'>[] = []
    for (const image of uploadedInWindow) {
      if (image.projectId === TARGET_PROJECT_ID) {
        alreadyInProjectIds.push(image._id)
        continue
      }
      await ctx.db.patch(image._id, { projectId: TARGET_PROJECT_ID })
      movedIds.push(image._id)
    }

    if (!movedIds.length) {
      throw new Error('all images from 2026-09-09 before 11:00 are already in the target project')
    }

    return {
      moved: movedIds.length,
      movedIds,
      alreadyInProject: alreadyInProjectIds.length,
      projectId: TARGET_PROJECT_ID,
    }
  },
})
