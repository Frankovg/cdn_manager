# CDN Assets Manager

An internal app for uploading, organizing, and sharing public images. Every image is hosted on a CDN and gets a public URL that is ready to use in websites, emails, or any other project.

## Features

- **Projects:** images are grouped by project. The sidebar lists every project and lets you search them by name. Only users with permission can create projects (see [Permissions](#permissions)).
- **Image uploads:** upload several images at once, in JPG, PNG, WebP, or SVG format, up to 4 MB each. When the upload finishes, the public URL is copied to the clipboard.
- **Library:** each project's images are shown in a paginated grid, with search by title, description, or file name and a date range filter.
- **Details and metadata:** every image has an editable title and description. It also records who uploaded it, when, its size, and its file type.
- **Private access:** every page requires a valid Clerk session; there are no public pages.

## Tech stack

| Area           | Technology                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| Web framework  | [Astro](https://astro.build) 7 in server mode (standalone Node adapter)                                 |
| UI             | [Vue](https://vuejs.org) 3 + [Vue Router](https://router.vuejs.org)                                     |
| Styling and UI | [Tailwind CSS](https://tailwindcss.com) 4, [Reka UI](https://reka-ui.com), [Lucide](https://lucide.dev) |
| Database       | [Convex](https://convex.dev) (real-time data, queries, mutations, and HTTP actions)                     |
| Authentication | [Clerk](https://clerk.com)                                                                              |
| Storage        | [UploadThing](https://uploadthing.com) (files and CDN)                                                  |
| Error tracking | [Sentry](https://sentry.io) (server only)                                                               |
| Code quality   | TypeScript, ESLint, Prettier, Vitest                                                                    |

### How the pieces fit together

1. The browser signs in with **Clerk** and uses that token to talk to **Convex**.
2. To upload an image, the browser calls `/api/upload`, an **Astro** endpoint that serves the **UploadThing** router.
3. Before accepting the file, that endpoint checks the user's session and that the project exists, using Convex HTTP actions (`convex/http.ts`).
4. When UploadThing finishes the upload, the server records the image in Convex. That call is authenticated with a shared secret (`UPLOADTHING_CALLBACK_SECRET`).

## Requirements

- **Node.js** 22.12 or later (the Docker image uses Node 24).
- **pnpm** 10 or later. The project pins `pnpm@10.14.0` in `package.json`; with [Corepack](https://nodejs.org/api/corepack.html), running `corepack enable` is enough.
- Accounts for the third-party services listed below.

## Third-party accounts

### Convex

Database and backend.

1. Create an account at [convex.dev](https://convex.dev).
2. The first time you run `pnpm convex:dev`, the CLI asks you to log in and creates (or links) a development deployment. The deployment URLs are shown in the Convex dashboard:
   - `https://<deployment>.convex.cloud` → `PUBLIC_CONVEX_URL`
   - `https://<deployment>.convex.site` → `CONVEX_ACTIONS_URL`
3. Set these environment variables **on the Convex deployment**, not in `.env`:

   ```sh
   npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<your-instance>.clerk.accounts.dev
   npx convex env set UPLOADTHING_CALLBACK_SECRET <same-value-as-in-your-env-file>
   ```

### Clerk

User authentication.

1. Create an application at [clerk.com](https://clerk.com).
2. Copy the **Publishable key** into `PUBLIC_CLERK_PUBLISHABLE_KEY`.
3. Copy the **Issuer** (the Frontend API URL, such as `https://<your-instance>.clerk.accounts.dev`) into the Convex `CLERK_JWT_ISSUER_DOMAIN` variable.
4. Create a **JWT template** named exactly `convex` (Clerk ships a predefined template for Convex) and add the permissions claim:

   ```json
   {
     "projects": "{{user.public_metadata.projects}}"
   }
   ```

### UploadThing

File storage and CDN.

1. Create an app at [uploadthing.com](https://uploadthing.com).
2. Copy the token from **API Keys** into `UPLOADTHING_TOKEN`.

### Sentry (optional)

Server error reporting.

- `SENTRY_DSN` enables error reporting.
- `SENTRY_AUTH_TOKEN` (in the build environment) enables source map uploads.

The app works the same without these variables.

## Permissions

Any signed-in user can view projects, upload images, and edit their metadata. To **create projects**, a user needs this public metadata in Clerk (**Users → user → Metadata → Public**):

```json
{
  "projects": true
}
```

## Getting started

1. Install dependencies:

   ```sh
   pnpm i
   ```

2. Create the environment file from the example and fill it in with the values from your accounts:

   ```sh
   cp .env.example .env
   ```

   | Variable                       | Used by           | Description                                               |
   | ------------------------------ | ----------------- | --------------------------------------------------------- |
   | `PUBLIC_CLERK_PUBLISHABLE_KEY` | Client            | Clerk publishable key.                                    |
   | `PUBLIC_CONVEX_URL`            | Client            | The deployment's `.convex.cloud` URL.                     |
   | `PUBLIC_UPLOAD_ENDPOINT_URL`   | Client (optional) | Alternative URL for the upload endpoint.                  |
   | `CONVEX_ACTIONS_URL`           | Server            | The deployment's `.convex.site` URL (HTTP actions).       |
   | `UPLOADTHING_TOKEN`            | Server            | UploadThing app token.                                    |
   | `UPLOADTHING_CALLBACK_SECRET`  | Server + Convex   | Secret shared by Astro and Convex. It must match in both. |
   | `SENTRY_DSN`                   | Server (optional) | Sentry DSN.                                               |
   | `VERSION`                      | Server (optional) | Version reported by the `/health` endpoint.               |

3. Start Convex and Astro, each in its own terminal:

   ```sh
   pnpm convex:dev   # syncs the functions in convex/ with the deployment
   pnpm dev          # Astro server at http://localhost:4321
   ```

4. Open [http://localhost:4321](http://localhost:4321) and sign in with Clerk.

## Scripts

| Command               | What it does                                     |
| --------------------- | ------------------------------------------------ |
| `pnpm dev`            | Astro development server.                        |
| `pnpm convex:dev`     | Syncs the Convex functions in development mode.  |
| `pnpm convex:codegen` | Regenerates the types in `convex/_generated/`.   |
| `pnpm typecheck`      | Type checking with `astro check`.                |
| `pnpm lint`           | ESLint.                                          |
| `pnpm format`         | Formats the code with Prettier.                  |
| `pnpm test`           | Vitest tests.                                    |
| `pnpm build`          | Type check + production build in `dist/`.        |
| `pnpm preview`        | Serves the production build locally.             |
| `pnpm deploy`         | Deploys the Convex functions and runs the build. |

## Project structure

```text
convex/            Backend: schema, queries, mutations, HTTP actions, and migrations
src/
  components/      Vue components (UI components live in components/ui)
  composables/     Reusable logic (projects, library, uploads)
  pages/           Astro routes: /api/upload and /health
  router/          Vue Router with the authentication guards
  server/          UploadThing router (server only)
  services/        Convex and UploadThing clients, validation
  views/           Application views
tests/             Vitest tests
scripts/jenkins/   CI pipelines
```

## Production

The `Dockerfile` builds the app and serves it with `node dist/server/entry.mjs`. The `/health` endpoint responds with the deployed version and works as a health check.
