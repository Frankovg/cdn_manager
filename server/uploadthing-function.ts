import { handleUploadThingRequest } from "./uploadthing.js";

/**
 * Provider-agnostic serverless entrypoint. Adapt this Fetch contract to the
 * hosting provider's function signature and expose it at /api/upload.
 */
export default function uploadThingFunction(request: Request): Promise<Response> {
  return handleUploadThingRequest(request);
}
