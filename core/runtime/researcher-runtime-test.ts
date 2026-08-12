
import "dotenv/config";

import { createScientiaCore } from "./bootstrap";

async function main() {
  const { runtime, researcher, context } = createScientiaCore();

  await runtime.agents.start(researcher, context);

  const result = await runtime.agents.execute(researcher, {
    question:
      "latest scientific discoveries in artificial intelligence",
  });

  console.log("Scientia Labs Researcher result:");
  console.dir(result, { depth: null });

  await runtime.agents.stop(researcher);
}

main().catch((error) => {
  console.error("Researcher runtime test failed:");
  console.error(error);
  process.exit(1);
});
