import { Application, Router, Context } from "jsr:@oak/oak";

import { Users } from "./users.ts";
import { router as userRouter } from "./routes/user.ts";
import { router as dataRouter } from "./routes/data.ts";
import { router as quizzRouter } from "./routes/quizz.ts";
import { staticServe } from "./static.ts";

const OPENAPI_PATH = "./api.yml";

//Statically serve what is in _site
const userModels = new Users();

//Server from api/v1
export const router = new Router({
  prefix: "/api/v1",
});

router.use(userRouter.routes(), userRouter.allowedMethods());
router.use(dataRouter.routes(), dataRouter.allowedMethods());
router.use(quizzRouter.routes(), quizzRouter.allowedMethods());

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

const app = new Application();
app.users = userModels; // Make users available in the app context
app.use(router.routes(), router.allowedMethods());
app.use(staticServe);

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });
