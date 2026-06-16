import { internalMutation, query } from './_generated/server'

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      throw new Error('Not authenticated')
    }

    return await ctx.db.query('greetings').collect()
  },
})

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    await ctx.db.insert('greetings', { message: 'Hello from Convex' })
    await ctx.db.insert('greetings', { message: 'Vue Query is working' })
  },
})
