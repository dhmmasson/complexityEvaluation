import { Router, Context } from "jsr:@oak/oak";

export const router = new Router();

router.post("/contact", async (ctx: Context) => {
  const body = ctx.request.body;
  if (body.type() === "form") {
    const formData = await body.formData();
    const email = formData.get("email");
    // append to contact.csv
    const line = `${email},${new Date().toISOString()}`;
    await Deno.writeFile(
      "./user_data/contact.csv",
      new TextEncoder().encode(line + "\n"),
      {
        append: true,
        create: true,
      }
    );
    //redirect to /
    ctx.response.redirect("/close.html");
    ctx.response.status = 302;
    return;
  }
});
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

    ctx.response.redirect("/max_max/" + user.user_id);
    ctx.response.status = 302;
    return;
  } else {
    ctx.response.body = { message: "Invalid content type" };
    ctx.response.status = 400;
    return;
  }
});
