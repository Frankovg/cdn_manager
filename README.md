# CDN Assets Manager

Aplicación interna para subir, organizar y compartir imágenes públicas. Cada imagen queda alojada en un CDN y se obtiene una URL pública lista para usar en sitios, emails o cualquier otro proyecto.

## Qué hace

- **Proyectos:** las imágenes se agrupan por proyecto. La barra lateral lista los proyectos y permite buscarlos por nombre. Solo los usuarios con permiso pueden crear proyectos (ver [Permisos](#permisos)).
- **Subida de imágenes:** se pueden subir varias imágenes a la vez, en formato JPG, PNG, WebP o SVG y de hasta 4 MB cada una. Al terminar, la URL pública se copia al portapapeles.
- **Biblioteca:** las imágenes de cada proyecto se muestran en una grilla paginada, con búsqueda por título, descripción o nombre de archivo y filtro por rango de fechas.
- **Detalle y metadatos:** cada imagen tiene título y descripción editables. También guarda quién la subió, cuándo, el tamaño y el tipo de archivo.
- **Acceso privado:** todas las páginas requieren una sesión válida de Clerk; no hay páginas públicas.

## Tecnologías

| Área              | Tecnología                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| Framework web     | [Astro](https://astro.build) 7 en modo servidor (adapter de Node standalone)                            |
| Interfaz          | [Vue](https://vuejs.org) 3 + [Vue Router](https://router.vuejs.org)                                     |
| Estilos y UI      | [Tailwind CSS](https://tailwindcss.com) 4, [Reka UI](https://reka-ui.com), [Lucide](https://lucide.dev) |
| Base de datos     | [Convex](https://convex.dev) (datos en tiempo real, queries, mutations y HTTP actions)                  |
| Autenticación     | [Clerk](https://clerk.com)                                                                              |
| Almacenamiento    | [UploadThing](https://uploadthing.com) (archivos y CDN)                                                 |
| Errores           | [Sentry](https://sentry.io) (solo en el servidor)                                                       |
| Calidad de código | TypeScript, ESLint, Prettier, Vitest                                                                    |

### Cómo encajan las piezas

1. El navegador inicia sesión con **Clerk** y usa ese token para hablar con **Convex**.
2. Para subir una imagen, el navegador llama a `/api/upload`, un endpoint de **Astro** que expone el router de **UploadThing**.
3. Antes de aceptar el archivo, ese endpoint valida la sesión del usuario y que el proyecto exista, usando las HTTP actions de Convex (`convex/http.ts`).
4. Cuando UploadThing termina la subida, el servidor registra la imagen en Convex. Esa llamada se autentica con un secreto compartido (`UPLOADTHING_CALLBACK_SECRET`).

## Requisitos

- **Node.js** 22.12 o superior (la imagen de Docker usa Node 24).
- **pnpm** 10 o superior. El proyecto fija `pnpm@10.14.0` en `package.json`; con [Corepack](https://nodejs.org/api/corepack.html) alcanza con `corepack enable`.
- Cuentas en los servicios de terceros que se listan abajo.

## Cuentas de terceros

### Convex

Base de datos y backend.

1. Crear una cuenta en [convex.dev](https://convex.dev).
2. Al correr `pnpm convex:dev` por primera vez, el CLI pide iniciar sesión y crea (o vincula) un deployment de desarrollo. Las URLs del deployment aparecen en el dashboard de Convex:
   - `https://<deployment>.convex.cloud` → `PUBLIC_CONVEX_URL`
   - `https://<deployment>.convex.site` → `CONVEX_ACTIONS_URL`
3. Configurar las variables de entorno **del deployment de Convex**, no del `.env`:

   ```sh
   npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<tu-instancia>.clerk.accounts.dev
   npx convex env set UPLOADTHING_CALLBACK_SECRET <el-mismo-valor-que-en-el-env>
   ```

### Clerk

Autenticación de usuarios.

1. Crear una aplicación en [clerk.com](https://clerk.com).
2. Copiar la **Publishable key** en `PUBLIC_CLERK_PUBLISHABLE_KEY`.
3. Copiar el **Issuer** (Frontend API URL, del estilo `https://<tu-instancia>.clerk.accounts.dev`) en la variable `CLERK_JWT_ISSUER_DOMAIN` de Convex.
4. Crear un **JWT template** llamado exactamente `convex` (Clerk tiene una plantilla predefinida para Convex) y agregarle el claim de permisos:

   ```json
   {
     "projects": "{{user.public_metadata.projects}}"
   }
   ```

### UploadThing

Almacenamiento de archivos y CDN.

1. Crear una app en [uploadthing.com](https://uploadthing.com).
2. Copiar el token desde **API Keys** en `UPLOADTHING_TOKEN`.

### Sentry (opcional)

Reporte de errores del servidor.

- `SENTRY_DSN` habilita el envío de errores.
- `SENTRY_AUTH_TOKEN` (en el entorno del build) permite subir los source maps.

Sin estas variables la aplicación funciona igual.

## Permisos

Cualquier usuario autenticado puede ver proyectos, subir imágenes y editar sus metadatos. Para **crear proyectos**, el usuario necesita esta metadata pública en Clerk (**Users → usuario → Metadata → Public**):

```json
{
  "projects": true
}
```

## Cómo levantar el proyecto

1. Instalar dependencias:

   ```sh
   pnpm i
   ```

2. Crear el archivo de entorno a partir del ejemplo y completarlo con los valores de tus cuentas:

   ```sh
   cp .env.example .env
   ```

   | Variable                       | Dónde se usa        | Descripción                                                       |
   | ------------------------------ | ------------------- | ----------------------------------------------------------------- |
   | `PUBLIC_CLERK_PUBLISHABLE_KEY` | Cliente             | Publishable key de Clerk.                                         |
   | `PUBLIC_CONVEX_URL`            | Cliente             | URL `.convex.cloud` del deployment.                               |
   | `PUBLIC_UPLOAD_ENDPOINT_URL`   | Cliente (opcional)  | URL alternativa del endpoint de subida.                           |
   | `CONVEX_ACTIONS_URL`           | Servidor            | URL `.convex.site` del deployment (HTTP actions).                 |
   | `UPLOADTHING_TOKEN`            | Servidor            | Token de la app de UploadThing.                                   |
   | `UPLOADTHING_CALLBACK_SECRET`  | Servidor + Convex   | Secreto compartido entre Astro y Convex. Debe coincidir en ambos. |
   | `SENTRY_DSN`                   | Servidor (opcional) | DSN de Sentry.                                                    |
   | `VERSION`                      | Servidor (opcional) | Versión que informa el endpoint `/health`.                        |

3. Levantar Convex y Astro, cada uno en su propia terminal:

   ```sh
   pnpm convex:dev   # sincroniza las funciones de convex/ con el deployment
   pnpm dev          # servidor de Astro en http://localhost:4321
   ```

4. Abrir [http://localhost:4321](http://localhost:4321) e iniciar sesión con Clerk.

## Scripts

| Comando               | Qué hace                                               |
| --------------------- | ------------------------------------------------------ |
| `pnpm dev`            | Servidor de desarrollo de Astro.                       |
| `pnpm convex:dev`     | Sincroniza las funciones de Convex en modo desarrollo. |
| `pnpm convex:codegen` | Regenera los tipos de `convex/_generated/`.            |
| `pnpm typecheck`      | Chequeo de tipos con `astro check`.                    |
| `pnpm lint`           | ESLint.                                                |
| `pnpm format`         | Formatea el código con Prettier.                       |
| `pnpm test`           | Tests con Vitest.                                      |
| `pnpm build`          | Typecheck + build de producción en `dist/`.            |
| `pnpm preview`        | Sirve el build de producción localmente.               |
| `pnpm deploy`         | Despliega las funciones de Convex y ejecuta el build.  |

## Estructura

```text
convex/            Backend: esquema, queries, mutations, HTTP actions y migraciones
src/
  components/      Componentes Vue (y componentes de UI en components/ui)
  composables/     Lógica reutilizable (proyectos, biblioteca, subidas)
  pages/           Rutas de Astro: /api/upload y /health
  router/          Vue Router con los guards de autenticación
  server/          Router de UploadThing (solo servidor)
  services/        Clientes de Convex y UploadThing, validaciones
  views/           Vistas de la aplicación
tests/             Tests de Vitest
scripts/jenkins/   Pipelines de CI
```

## Producción

El `Dockerfile` construye la aplicación y la sirve con `node dist/server/entry.mjs`. El endpoint `/health` responde con la versión desplegada y sirve como chequeo de salud.
