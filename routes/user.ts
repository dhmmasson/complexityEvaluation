import { Router, Context } from "jsr:@oak/oak";
import { Users } from "../users.ts";

export const router = new Router();
const userModels = new Users();

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
    // Redirect to /evaluation
    ctx.response.redirect("/evaluation/" + user.user_id);
    ctx.response.status = 302;
    return;
  } else {
    ctx.response.body = { message: "Invalid content type" };
    ctx.response.status = 400;
    return;
  }
});
