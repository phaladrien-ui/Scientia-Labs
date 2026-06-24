import { compare, hash } from "bcrypt-ts";

const storedHash = "$2a$10$dsKisEJio1bo7Qz9/NV7g.8wnF8bXZxTx2VopIZviQOh2AfzMtzhi";

async function test() {
  // Teste avec le mot de passe que tu utilises pour te connecter
  const yourPassword = "TON_MOT_DE_PASSE_ICI"; // ← remplace par ton vrai mot de passe
  
  const result = await compare(yourPassword, storedHash);
  console.log("Résultat compare:", result);
  
  // Teste aussi un hash frais
  const newHash = await hash(yourPassword, 10);
  console.log("Nouveau hash:", newHash);
  console.log("Compare nouveau hash:", await compare(yourPassword, newHash));
}

test();