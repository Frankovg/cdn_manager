import type { AuthConfig } from "convex/server";

/**
 * Convex validates Clerk JWTs with the issuer configured on the deployment.
 * Set CLERK_JWT_ISSUER_DOMAIN with `npx convex env set` (or in the Convex
 * dashboard); it must not be bundled into the Vite application.
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
