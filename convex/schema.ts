import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.string(),
  }),
  images: defineTable({
    projectId: v.id("projects"),
    publicUrl: v.string(),
    fileKey: v.string(),
    uploadedByClerkId: v.string(),
    authorName: v.optional(v.string()),
    authorEmail: v.optional(v.string()),
    uploadedAt: v.number(),
    originalFilename: v.string(),
    sizeBytes: v.number(),
    mimeType: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_project_uploaded_at", ["projectId", "uploadedAt"])
    .index("by_file_key", ["fileKey"]),
});
