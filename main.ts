import { Application, Router, Context } from "jsr:@oak/oak";
import { join } from "jsr:@std/path";

const OPENAPI_PATH = "./api.yml";

const router = new Router();

// POST /user/
router.post("/user", async (ctx: Context) => {
  const body = ctx.request.body;
  console.log("Received body:", await body.json());
  const userData = await body.json();

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
  ctx.response.headers.set(
    "Content-Disposition",
    "attachment; filename=api.yml"
  );
  ctx.response.body = await Deno.open(OPENAPI_PATH);
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });
