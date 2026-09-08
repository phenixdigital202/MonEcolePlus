import prismaMaster from "../lib/prisma";

async function main() {
  const user = await prismaMaster.user.findFirst();
  const ecole = await prismaMaster.ecole.findFirst();
  console.log("User keys:", user ? Object.keys(user) : "none");
  console.log("Ecole keys:", ecole ? Object.keys(ecole) : "none");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
