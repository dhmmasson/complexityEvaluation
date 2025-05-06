import { Router, Context } from "jsr:@oak/oak";

export const router = new Router();

router.get("/quizz/:userId", (ctx: Context) => {
  const userId = ctx.params.userId;
  console.log("User ID:", userId);
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
