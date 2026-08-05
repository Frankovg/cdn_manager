import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { UserIdentity } from "convex/server";

type AuthContext = Pick<QueryCtx | MutationCtx, "auth">;

export interface AuthenticatedUser {
  clerkUserId: string;
  authorName?: string;
  authorEmail?: string;
}

/**
 * The Clerk `convex` JWT template exposes `projects` from the user's public
 * metadata. Convex receives this value only after validating that signed JWT.
 */
export function hasProjectsPermission(identity: UserIdentity): boolean {
  return identity.projects === true;
}

export async function requireAuthenticatedUser(ctx: AuthContext): Promise<AuthenticatedUser> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("You are not authenticated.");
  }

  return {
    clerkUserId: identity.subject,
    ...(identity.name || identity.preferredUsername
      ? { authorName: identity.name ?? identity.preferredUsername }
      : {}),
    ...(identity.email ? { authorEmail: identity.email } : {}),
  };
}

export async function requireProjectsPermission(ctx: AuthContext): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser(ctx);
  const identity = await ctx.auth.getUserIdentity();

  if (!identity || !hasProjectsPermission(identity)) {
    throw new Error("You do not have permission to manage projects.");
  }

  return user;
}
