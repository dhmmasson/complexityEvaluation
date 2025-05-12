import { join } from "jsr:@std/path";
import path from "node:path";
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
    const userIdPathes = [
      "/max_max/",
      "/min_min/",
      "/max_min/",
      "/min_max/",
      "/evaluation/",
    ];

    // Check if the path is in the format /<file>/userId
    if (filePath.match(/\/(max_max|min_min|max_min|min_max|evaluation)\/.*/)) {
      if (filePath.match(/\/[-0-9a-f]+$/)) {
        // remove the userId from the path
        filePath = filePath.replace(
          /\/(max_max|min_min|max_min|min_max|evaluation)\/.*/,
          "/$1.html"
        );
      } else {
        // remove the first part of the path
        filePath = filePath.replace(
          /\/(max_max|min_min|max_min|min_max|evaluation)\/(.*)/,
          "/$2"
        );
      }

      if (filePath === "/evaluation.html") {
        filePath = "evaluation/evaluation.html";
      }
    }
    console.log("File path after userId check:", filePath);
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
