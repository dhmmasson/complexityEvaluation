import { Context } from "@oak/oak/context";
import { Router } from "@oak/oak/router";

export const router = new Router();

// GET /data/:dataId
router.get("/data/:dataId", (ctx: Context) => {
  const dataId = ctx?.params?.id.dataId;
  console.log("Data ID:", dataId);
  // TODO: Fetch and return data for dataId
  ctx.response.status = 200;
  ctx.response.body = {
    data_id: dataId,
    length: 0,
    data: [], // Example: [{ x: 1, y: 2 }]
  };
});

export default router;
