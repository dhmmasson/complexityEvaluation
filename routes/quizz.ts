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

  user.seed = seed;
  ctx.response.status = 200;
  ctx.response.body = {
    user_id: userId,
    configurations: configurations,
  };
  ctx.response.type = "application/json";
});

// POST /quizz
router.post("/quizz", async (ctx: Context) => {
  const body = ctx.request.body;

  if (body.type() === "form") {
    const formData = await body.formData();
    const userId = formData.get("user_id");

    const user = ctx.app.users.getUser(userId);
    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { message: "User not found" };
      return;
    }
    const seed = formData.get("seed");
    const orderKey = formData.get("orderKey");
    const preference = formData.get("preference");
    if (!seed || !orderKey || !preference) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Seed and OrderKey are required" };
      return;
    }
    const configuration = configurationManager.getConfigurationFromSeed(
      +seed || 0,
      orderKey as OrderKey
    );
    configurationManager.countConfiguration(configuration);
    configurationManager.savePreferences(
      userId as string,
      configuration,
      preference as string
    );
    user.answers.push({
      seed: +seed,
      orderKey: orderKey,
      preference: preference,
      startTime: new Date().toISOString(),
    });

    if (user.answer >= 40) {
      ctx.response.redirect("/thankyou");
      ctx.response.status = 302;
      return;
    }

    // Redirect to /evaluation
    ctx.response.redirect("/evaluation/" + userId);
    ctx.response.status = 302;
  }

  // redirect to the quizz page
});
