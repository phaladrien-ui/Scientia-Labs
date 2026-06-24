import { hash } from "bcrypt-ts";

async function main() {
  const newPassword = "PhalAdamou1."; // ← remplace
  const newHash = await hash(newPassword, 10);
  console.log("Nouveau hash:", newHash);
}

main();