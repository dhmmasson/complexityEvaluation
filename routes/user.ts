import { Router, Context } from "jsr:@oak/oak";

export const router = new Router();

// POST /user/
router.post("/user", async (ctx: Context) => {
  const body = ctx.request.body;
  const userModels = ctx.app.users; // Access the users from the app context

  // handle application/x-www-form-urlencoded
  if (body.type() === "form") {
    const formData = await body.formData();
    const user = userModels.createUser(formData);
    userModels.save();
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
