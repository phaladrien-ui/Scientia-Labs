import { createScientiaCore } from "./bootstrap";

async function main() {
  const { runtime, researcher, context } = createScientiaCore();

  await runtime.agents.start(researcher, context);

  const result = await runtime.agents.execute(
    researcher,
    {
      question: context.task.objective,
    }
  );

  console.log("Scientia Core result:");
  console.log(result);

  await runtime.agents.stop(researcher);
}

main().catch((error) => {
  console.error("Scientia Core failed:", error);
  process.exit(1);
});