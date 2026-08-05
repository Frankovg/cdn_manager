# CDN Assets Manager

App interna Vue 3 para gestionar imágenes por proyecto (UploadThing + Convex + Clerk). Especificación completa en [CDN-Assets-Manager.md](./CDN-Assets-Manager.md).

## Requisitos

- Node.js ≥ 20.19, pnpm ≥ 10
- Cuentas en [Clerk](https://clerk.com), [Convex](https://convex.dev) y [UploadThing](https://uploadthing.com)

## Instalación

```sh
pnpm install
cp .env.example .env
```

Completa `.env` con tus credenciales. No lo commitees. Referencia de variables en [`.env.example`](./.env.example).

## Configuración mínima

**Clerk:** `VITE_CLERK_PUBLISHABLE_KEY` para Vue. Configura el JWT template `convex` con audience `convex` y el claim exacto `"projects": "{{user.public_metadata.projects}}"`. Convex valida la sesión que reenvía la función de UploadThing; no hace falta `CLERK_JWT_KEY`. Orígenes locales: `http://localhost:5173` y `http://localhost:5173/sign-in`.

**Convex:** `pnpm convex:dev` (primera vez: vincular deployment y copiar la URL a `VITE_CONVEX_URL`). En el deployment, setear `CLERK_JWT_ISSUER_DOMAIN` con el issuer de Clerk (sin barra final). Convex valida el JWT del template `convex` y lee el claim firmado `projects`; no requiere `CLERK_SECRET_KEY`.

**UploadThing:** token v7 en `UPLOADTHING_TOKEN` (solo backend). En el dashboard, activa **Allow Overriding ACL** (la ruta usa `public-read`). En local, `VITE_UPLOAD_ENDPOINT_URL=http://localhost:8787/api/upload`; en producción, `/api/upload` si la función comparte dominio con el frontend. La función reenvía el token de sesión a Convex para autenticar la petición y registra cada callback en Convex mediante `CONVEX_SITE_URL` y `UPLOADTHING_CALLBACK_SECRET`.

Solo las variables `VITE_*` van al bundle del browser. El resto es server-side.

## Arranque local

```sh
make serve
```

Abre <http://localhost:5173>. En local se levantan Vite, Convex y el adaptador Node del handler de UploadThing en `8787`. Ese proceso Node es solo para desarrollo.

## Validación

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Producción

Build del frontend con las `VITE_*` de producción y despliegue del directorio estático generado por Vite. Despliega también `api/upload.ts` como una función HTTP serverless en `/api/upload`; el entrypoint usa el contrato estándar `Request → Response` y puede adaptarse al proveedor elegido sin mover la lógica de UploadThing. `UPLOADTHING_TOKEN` y `UPLOADTHING_CALLBACK_SECRET` viven solo en esa función; nunca entran en el bundle del frontend. `CORS_ORIGIN` debe contener únicamente los orígenes reales autorizados del browser cuando frontend y función estén en dominios distintos.

La función necesita `CONVEX_SITE_URL` y las variables de UploadThing del ejemplo de producción. En Convex configura `CLERK_JWT_ISSUER_DOMAIN` y el mismo `UPLOADTHING_CALLBACK_SECRET`. La función no reemplaza a Convex ni a UploadThing: enruta las peticiones y ejecuta el handler de UploadThing.
