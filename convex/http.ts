import { httpRouter } from "convex/server";
import { authenticate, complete, validateProject } from "./uploadthing";

const http = httpRouter();

http.route({
  path: "/uploadthing-auth",
  method: "GET",
  handler: authenticate,
});

http.route({
  path: "/uploadthing-complete",
  method: "POST",
  handler: complete,
});

http.route({
  path: "/uploadthing-project",
  method: "POST",
  handler: validateProject,
});

export default http;
