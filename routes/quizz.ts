import { Router, Context } from "jsr:@oak/oak";
import { ConfigurationManager, OrderKey } from "../configuration.ts";

export const router = new Router();
const configurationManager = new ConfigurationManager();

router.get("/quizz/:userId", (ctx: Context) => {
  const userId = ctx.params.userId;

  console.log("User ID:", userId);
  if (!userId) {
    ctx.response.status = 400;
    ctx.response.body = { message: "User ID is required" };
    return;
  }
  const user = ctx.app.users.getUser(userId);
  if (!user) {
    ctx.response.status = 404;
    ctx.response.body = { message: "User not found" };
    return;
  }
  const seed = user.seed;
  const configurations = configurationManager.nextConfiguration(
    seed,
    OrderKey.max_max,
    []
  );
  console.log("Configurations:", configurations);
  user.seed = seed;
  ctx.response.status = 200;
  ctx.response.body = {
    user_id: userId,
    configurations: configurations,
  };
  ctx.response.type = "application/json";
});

// POST /quizz
router.post("/quizz/:userId", async (ctx: Context) => {
  const body = ctx.request.body({ type: "json" });
  const quizData = await body.value;

  // TODO: Validate and store quizData (user_id, c1, c2, preference)
  ctx.response.status = 200;
  ctx.response.body = { message: "Quiz choice saved" };
});
