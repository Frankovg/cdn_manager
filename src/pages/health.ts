import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  return new Response(`cdn-assets-manager ${process.env.VERSION} is ok`);
};
