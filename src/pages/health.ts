import type { APIRoute } from 'astro'
import { VERSION } from 'astro:env/server'

export const GET: APIRoute = async () => {
  return new Response(`cdn-assets-manager ${VERSION} is ok`)
}
