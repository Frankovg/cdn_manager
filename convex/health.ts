import { query } from './_generated/server'

/**
 * Authenticated connectivity check used by the private Vue smoke-test page.
 * The identity always comes from Convex's verified Clerk JWT; no browser-
 * supplied user ID is accepted.
 */
export const authenticated = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (identity === null) {
      throw new Error('You are not authenticated.')
    }

    return {
      authenticated: true as const,
      userId: identity.subject,
      subject: identity.subject,
      issuer: identity.issuer,
      name: identity.name ?? null,
      email: identity.email ?? null,
    }
  },
})
