import { Context } from "@oak/oak/context";
import { Router } from "@oak/oak/router";

export const router = new Router();

// GET /data/:dataId
router.get("/data/:dataId", async (ctx: Context) => {
  const dataId = ctx?.params?.dataId;
  console.log("Data ID:", dataId);
  // TODO: Fetch and return data for dataId
  //open data/Us.csv
  const data = await Deno.readTextFile("./data/Us.csv");
  ctx.response.type = "text/csv";
  ctx.response.status = 200;
  ctx.response.body = data;
});

export default router;
