import type { APIRoute } from "astro";
import { handleUploadThingRequest } from "../../server/upload-endpoints";

export const GET: APIRoute = ({ request }) => handleUploadThingRequest(request);
export const POST: APIRoute = ({ request }) => handleUploadThingRequest(request);
