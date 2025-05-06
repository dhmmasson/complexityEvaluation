import { stat } from "node:fs";
import { Application, Router, Context } from "jsr:@oak/oak";
import { join } from "jsr:@std/path";
import { User, Users } from "./users.ts";

const OPENAPI_PATH = "./api.yml";

//Statically serve what is in _site
const userModels = new Users();
await userModels.load();

//Server from api/v1
const router = new Router({
  prefix: "/api/v1",
});

// POST /user/
router.post("/user", async (ctx: Context) => {
  const body = ctx.request.body;
  console.log("Received body:", body.type());

  // handle application/x-www-form-urlencoded
  if (body.type() === "form") {
    const formData = await body.formData();
    console.log("Form data:", formData);
    const user = userModels.createUser(formData);
    userModels.save();
    console.log("User object:", user);
    ctx.response.status = 200;
    ctx.response.body = { message: JSON.stringify(user) };
    return;
  } else {
    ctx.response.body = { message: "Invalid content type" };
    ctx.response.status = 400;
    return;
  }

  // TODO: Validate and save userData
  // TODO: Generate and return a user_id
  ctx.response.status = 200;
  ctx.response.body = { user_id: "generated-user-id" };
});

// GET /data/:dataId
router.get("/data/:dataId", (ctx: Context) => {
  const dataId = ctx.params.dataId;

  // TODO: Fetch and return data for dataId
  ctx.response.status = 200;
  ctx.response.body = {
    data_id: dataId,
    length: 0,
    data: [], // Example: [{ x: 1, y: 2 }]
  };
});

// GET /quizz/:userId
router.get("/quizz/:userId", (ctx: Context) => {
  const userId = ctx.params.userId;

  // TODO: Fetch next quiz options and order for user
  ctx.response.status = 200;
  ctx.response.body = {
    order: "Max-Max", // Example
    c1: "data-id-1",
    c2: "data-id-2",
  };
});

// POST /quizz
router.post("/quizz/:userId", async (ctx: Context) => {
  const body = ctx.request.body({ type: "json" });
  const quizData = await body.value;

  // TODO: Validate and store quizData (user_id, c1, c2, preference)
  ctx.response.status = 200;
  ctx.response.body = { message: "Quiz choice saved" };
});

// Serve OpenAPI YAML description
router.get("/openapi.yaml", async (ctx: Context) => {
  ctx.response.status = 200;
  ctx.response.type = "application/x-yaml";
  // ctx.response.headers.set(
  //   "Content-Disposition",
  //   "attachment; filename=api.yml"
  // );
  ctx.response.body = await Deno.open(OPENAPI_PATH);
});

// // Create a new router to serve the static html, css... (directly from root to _site)
const staticRouter = new Router();

const mimeTypes = {
  html: "text/html",
  css: "text/css",
  js: "application/javascript",
  json: "application/json",
  png: "image/png",
  jpg: "image/jpeg",
};

staticRouter.use(async (ctx: Context) => {
  console.log("Static file request:", ctx.request.url.pathname);
  const filePath = ctx.request.url.pathname;
  const file = await Deno.open(join("_site", filePath), {
    read: true,
    write: false,
    create: false,
  });

  const extension = filePath.split(".").pop();
  ctx.response.type = mimeTypes[extension] || "application/octet-stream";
  if (ctx.response.type === "application/octet-stream") {
    console.warn("Unknown file type for", filePath);
  }
  ctx.response.body = file;
});

const app = new Application();

app.use(router.routes(), router.allowedMethods(), async (context, next) => {
  try {
    // Check if the request is for a static file
    let filePath = context.request.url.pathname;

    // check if / replace with index.html
    if (filePath === "/") {
      filePath = "/index.html";
    }
    if (!filePath.startsWith("/api/v1/")) {
      const file = await Deno.open(join("_site", filePath), {
        read: true,
        write: false,
        create: false,
      });
      const extension = filePath.split(".").pop();
      context.response.type =
        mimeTypes[extension] || "application/octet-stream";
      if (context.response.type === "application/octet-stream") {
        console.warn("Unknown file type for", filePath);
      }
      context.response.body = file;
      return;
    }
  } catch {
    await next();
  }
});

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });
