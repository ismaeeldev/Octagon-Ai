import { PrismaClient } from "../generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import 'dotenv/config';

const adapter = new PrismaNeon({ 
  connectionString: process.env.DATABASE_URL! 
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const fighters = await prisma.fighter.findMany({
    take: 10
  });

  console.log(`Total fighters in DB: ${await prisma.fighter.count()}`);
  console.log("First 10 fighters in DB:");
  for (const f of fighters) {
    console.log(`- ID: ${f.id} | Name: "${f.name}" | imageUrl: "${f.imageUrl}"`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
