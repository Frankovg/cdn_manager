import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  greetings: defineTable({
    message: v.string(),
  }),
})
