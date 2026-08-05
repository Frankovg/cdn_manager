import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireAuthenticatedUser } from "./auth";
import {
  normalizeRequiredText,
  validateImageFile,
  validatePublicUploadThingUrl,
} from "./validation";

const uploadRecordArgs = {
  projectId: v.id("projects"),
  fileKey: v.string(),
  publicUrl: v.string(),
  originalFilename: v.string(),
  sizeBytes: v.number(),
  mimeType: v.string(),
  uploadedByClerkId: v.string(),
  authorName: v.optional(v.string()),
  authorEmail: v.optional(v.string()),
};

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAuthenticatedUser(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("The project does not exist.");
    return ctx.db
      .query("images")
      .withIndex("by_project_uploaded_at", (query) => query.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

/** Only the UploadThing callback HTTP action may call this mutation. */
export const recordCompletedUpload = internalMutation({
  args: uploadRecordArgs,
  handler: async (ctx, args) => {
    validateImageFile(args.originalFilename, args.mimeType, args.sizeBytes);
    validatePublicUploadThingUrl(args.publicUrl, args.fileKey);
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("The project does not exist.");

    const existing = await ctx.db
      .query("images")
      .withIndex("by_file_key", (query) => query.eq("fileKey", args.fileKey))
      .unique();
    if (existing) return existing._id;

    return ctx.db.insert("images", {
      ...args,
      uploadedAt: Date.now(),
      title: args.originalFilename,
    });
  },
});

/** Records a file after the browser has received UploadThing's successful response. */
export const recordUploadedImage = mutation({
  args: {
    projectId: v.id("projects"),
    fileKey: v.string(),
    publicUrl: v.string(),
    originalFilename: v.string(),
    sizeBytes: v.number(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthenticatedUser(ctx);
    validateImageFile(args.originalFilename, args.mimeType, args.sizeBytes);
    validatePublicUploadThingUrl(args.publicUrl, args.fileKey);
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("The project does not exist.");

    const existing = await ctx.db
      .query("images")
      .withIndex("by_file_key", (query) => query.eq("fileKey", args.fileKey))
      .unique();
    if (existing) return existing._id;

    return ctx.db.insert("images", {
      ...args,
      uploadedByClerkId: user.clerkUserId,
      ...(user.authorName ? { authorName: user.authorName } : {}),
      ...(user.authorEmail ? { authorEmail: user.authorEmail } : {}),
      uploadedAt: Date.now(),
      title: args.originalFilename,
    });
  },
});

export const updateMetadata = mutation({
  args: {
    imageId: v.id("images"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuthenticatedUser(ctx);
    const image = await ctx.db.get(args.imageId);
    if (!image) throw new Error("The image does not exist.");

    const title = normalizeRequiredText(args.title, "Title");
    const description = args.description?.trim();
    await ctx.db.patch(args.imageId, {
      title,
      ...(description ? { description } : { description: undefined }),
    });
  },
});
