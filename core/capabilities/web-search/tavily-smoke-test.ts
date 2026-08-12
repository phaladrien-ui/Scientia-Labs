
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { searchTavily } = await import("./providers/tavily");

  const result = await searchTavily(
    "latest advances in artificial intelligence"
  );

  console.log("Tavily search result:");
  console.dir(result, { depth: null });
}

main().catch((error) => {
  console.error("Tavily smoke test failed:");
  console.error(error);
  process.exit(1);
});
