import { Router, Context } from "jsr:@oak/oak";
import { parse, stringify } from "jsr:@std/csv";

import {
  ConfigurationManager,
  OrderKey,
  prettyPrintShapeKey,
} from "../configuration.ts";
import { config } from "node:process";

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

  let configurations = null;

  if (user.answers.length % 10 === 0) {
    // static question
    seed = configurationManager.getSeedFromShapeKeys([7, 5]);
    configurations = configurationManager.getConfigurationFromSeed(
      (seed * stage + 1) % 1 || seed,
      orderKey
    );
  } else if (user.answers.length % 10 === 9) {
    const answers = user.answers.slice(-8); // get the last 8 answers (skip the static one)
    //pick a random answer in the last 8
    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
    configurations = configurationManager.getConfigurationFromSeed(
      randomAnswer.seed,
      randomAnswer.orderKey
    );
    const shapeKeys = configurations.shapeKeys;
    const temp = shapeKeys[0];
    shapeKeys[0] = shapeKeys[1];
    shapeKeys[1] = temp;

    seed = configurationManager.getSeedFromShapeKeys(shapeKeys);
    configurations = configurationManager.getConfigurationFromSeed(
      seed,
      orderKey
    );
  } else {
    configurations = configurationManager.nextConfiguration(
      (seed * (stage + 1)) % 1 || seed,
      orderKey,
      []
    );
  }
  // configurations = configurationManager.getConfigurationFromSeed(seed, orderKey);

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
      ctx.response.redirect("/thankyou.html");
      ctx.response.status = 302;
      return;
    }

    // Redirect to /evaluation
    if (user.answers.length % 10 === 0) {
      switch (user.answers.length / 10) {
        case 1:
          ctx.response.redirect("/min_min/" + userId);
          break;
        case 2:
          ctx.response.redirect("/max_min/" + userId);
          break;
        case 3:
          ctx.response.redirect("/min_max/" + userId);
          break;
        case 4:
          ctx.response.redirect("/thankyou");
          break;
        default:
          ctx.response.redirect("/thankyou.html");
          break;
      }
    } else {
      ctx.response.redirect("/evaluation/" + userId);
    }

    ctx.response.status = 302;
  }

  // redirect to the quizz page
});

router.post("/training", async (ctx: Context) => {
  const body = ctx.request.body;
  if (body.type() === "form") {
    const formData = await body.formData();
    console.log("Form data:", formData);
    const userId = formData.get("user_id");
    const user = ctx.app.users.getUser(userId);
    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { message: "User not found" };
      return;
    }
    console.log(JSON.stringify(formData));
    const trainingData = {
      user_id: userId ?? "",
      e1: formData.get("e1") ?? "",
      e2: formData.get("e2") ?? "",
      e3: formData.get("e3") ?? "",
      e4: formData.get("e4") ?? "",
      e5: formData.get("e5") ?? "",
    };
    user.training = trainingData;
    ctx.app.users.save();

    // load the training csv
    const columns = ["user_id", "e1", "e2", "e3", "e4", "e5"];

    const trainingDataPath = "./user_data/training.csv";
    let trainingDataCsv = columns.join(",");
    try {
      trainingDataCsv = await Deno.readTextFile(trainingDataPath);
    } catch (e) {}
    console.log("Training data CSV:", trainingDataCsv);

    const trainingDataArray = parse(trainingDataCsv, {
      skipFirstRow: true,
      columns: columns,
    });
    // Append the new training data to the CSV file

    trainingDataArray.push(trainingData);
    const trainingDataString = stringify(trainingDataArray, {
      columns: columns,
    });
    await Deno.writeFile(
      trainingDataPath,
      new TextEncoder().encode(trainingDataString)
    );

    ctx.response.redirect("/max_max/" + userId);
    ctx.response.status = 302;
  } else {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid request format." };
  }
});
