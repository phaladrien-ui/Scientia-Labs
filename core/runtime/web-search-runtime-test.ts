
import { config } from "dotenv";

config({ path: ".env.local" });

import { createScientiaCore } from "./bootstrap";

async function main() {
  const { runtime } = createScientiaCore();

  const webSearch = runtime.capabilities.get("web.search");

  const result = await webSearch.execute({
    query: "latest scientific discoveries in artificial intelligence",
  });

  console.log("Scientia Labs Web Search result:");
  console.dir(result, { depth: null });
}

main().catch((error) => {
  console.error("Web Search runtime test failed:");
  console.error(error);
  process.exit(1);
});