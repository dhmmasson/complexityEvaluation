import { join } from "jsr:@std/path";
const mimeTypes = {
  html: "text/html",
  css: "text/css",
  js: "application/javascript",
  json: "application/json",
  png: "image/png",
  jpg: "image/jpeg",
};

export const staticServe = async (context, next) => {
  try {
    // Check if the request is for a static file
    let filePath = context.request.url.pathname;

    // check if / replace with index.html
    if (filePath === "/") {
      filePath = "/index.html";
    }
    console.log("File path:", filePath);
    if (filePath.startsWith("/evaluation/")) {
      filePath = "evaluation/evaluation.html";
    }

    if (!filePath.startsWith("/api/v1/")) {
      const file = await Deno.open(join("_site", filePath), {
        read: true,
        write: false,
        create: false,
      });
      const extension = filePath.split(".").pop();
      context.response.type =
        mimeTypes[extension] || "application/octet-stream";
      if (context.response.type === "application/octet-stream") {
        console.warn("Unknown file type for", filePath);
      }
      context.response.body = file;
      return;
    }
  } catch {
    await next();
  }
};
