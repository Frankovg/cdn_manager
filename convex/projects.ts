import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { hasProjectsPermission, requireAuthenticatedUser, requireProjectsPermission } from "./auth";
import { normalizeRequiredText } from "./validation";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAuthenticatedUser(ctx);
    return ctx.db.query("projects").collect();
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAuthenticatedUser(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("The project does not exist.");
    return project;
  },
});

export const getForUpload = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => ctx.db.get(args.projectId),
});

export const canManage = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("You are not authenticated.");
    return hasProjectsPermission(identity);
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const user = await requireProjectsPermission(ctx);
    const now = Date.now();
    return ctx.db.insert("projects", {
      name: normalizeRequiredText(args.name, "Project name"),
      createdAt: now,
      updatedAt: now,
      createdBy: user.clerkUserId,
    });
  },
});

export const rename = mutation({
  args: { projectId: v.id("projects"), name: v.string() },
  handler: async (ctx, args) => {
    await requireProjectsPermission(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("The project does not exist.");
    await ctx.db.patch(args.projectId, {
      name: normalizeRequiredText(args.name, "Project name"),
      updatedAt: Date.now(),
    });
  },
});
