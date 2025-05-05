import { serve } from "https://deno.land/std/http/server.ts";
import { parse } from "https://deno.land/std/yaml/mod.ts";

// Path to your OpenAPI YAML file
const OPENAPI_PATH = "./api.yml"; // Update this if needed

// Load and parse YAML on startup
const yamlContent = await Deno.readTextFile(OPENAPI_PATH);
const parsedYaml = parse(yamlContent);

serve(
  (_req) =>
    new Response(JSON.stringify(parsedYaml, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow CORS for all origins
      },
      status: 200,
    }),
  {
    port: 8000,
    onListen: ({ hostname, port }) => {
      console.log(`Server running at http://${hostname}:${port}/`);
    },
  }
);
