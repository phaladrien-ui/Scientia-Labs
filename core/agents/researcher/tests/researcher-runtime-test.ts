// NOUVEAU :
import { createScientiaCore } from "../../../runtime/bootstrap";

async function main() {
  console.log("==========================================");
  console.log(" Scientia Labs — Researcher Agent Test");
  console.log("==========================================\n");

  /*
   * ============================================================
   * 1. CREATE SCIENTIA CORE
   * ============================================================
   */

  const {
    runtime,
    researcher,
    context
  } = createScientiaCore();

  /*
   * ============================================================
   * 2. INITIALIZE RESEARCHER
   * ============================================================
   */

  await researcher.initialize(context);

  console.log(
    "[Researcher Test] Researcher initialized."
  );

  /*
   * ============================================================
   * 3. EXECUTE RESEARCH
   * ============================================================
   */

  const result =
    await researcher.execute({
      question:
        "What are the current limitations of AI systems in scientific discovery?"
    });

  /*
   * ============================================================
   * 4. DISPLAY RESULT
   * ============================================================
   */

  console.log("\n==========================================");
  console.log(" FINAL RESEARCH RESULT");
  console.log("==========================================\n");

  console.log(result.summary);

  /*
   * ============================================================
   * 5. DISPLAY SOURCES
   * ============================================================
   */

  console.log("\n==========================================");
  console.log(
    ` SOURCES: ${result.sources.length}`
  );
  console.log("==========================================\n");

  for (
    const [index, source] of
    result.sources.entries()
  ) {
    console.log(`Source ${index + 1}:`);

    console.log(
      `Title: ${source.title}`
    );

    console.log(
      `URL: ${source.url}`
    );

    console.log(
      `Score: ${
        source.evaluation?.score ??
        "unknown"
      }/100`
    );

    console.log("");
  }

  /*
   * ============================================================
   * 6. SHUTDOWN
   * ============================================================
   */

  await researcher.shutdown();

  console.log(
    "[Researcher Test] Completed successfully."
  );
}

main().catch((error) => {
  console.error(
    "\n[Researcher Test] FAILED\n",
    error
  );

  process.exit(1);
});