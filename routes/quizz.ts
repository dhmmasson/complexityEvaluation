import { Router, Context } from "jsr:@oak/oak";
import {
  ConfigurationManager,
  OrderKey,
  prettyPrintShapeKey,
} from "../configuration.ts";

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
  let seed = user.seed;
  let orderKey = OrderKey.max_max;
  let stage = Math.floor(user.answers.length / 10) % 4;
  switch (stage) {
    case 0:
      orderKey = OrderKey.max_max;
      break;
    case 1:
      orderKey = OrderKey.min_min;
      break;
    case 2:
      orderKey = OrderKey.max_min;
      break;
    case 3:
      orderKey = OrderKey.min_max;
      break;
  }

  if (user.answers.length % 10 === 0) {
    // static question
    seed = 0.156489;
  } else if (user.answers.length % 10 === 9) {
    const answers = user.answers.slice(-8); // get the last 8 answers (skip the static one)
    //pick a random answer in the last 8
    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
    seed = randomAnswer.seed;
  }
  const configurations = configurationManager.nextConfiguration(
    seed * stage,
    orderKey,
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
    const elapsedTime = formData.get("elapsedTime");
    const screenSize = formData.get("screenSize");
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
      preference as string,
      elapsedTime as string
    );
    user.answers.push({
      seed: +seed,
      orderKey: orderKey,
      A: prettyPrintShapeKey(configuration.shapeKeys[0]),
      B: prettyPrintShapeKey(configuration.shapeKeys[1]),
      preference: preference,
      elapsedTime: elapsedTime,
      screenSize: screenSize,
    });
    ctx.app.users.save();
    if (user.answers.length >= 40) {
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
