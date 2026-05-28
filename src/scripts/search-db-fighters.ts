import { PrismaClient } from "../generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import 'dotenv/config';

const adapter = new PrismaNeon({ 
  connectionString: process.env.DATABASE_URL! 
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const fighters = await prisma.fighter.findMany({
    where: {
      OR: [
        { name: { contains: "Pereira", mode: "insensitive" } },
        { name: { contains: "Holloway", mode: "insensitive" } },
        { name: { contains: "Gaethje", mode: "insensitive" } }
      ]
    }
  });

  console.log(`Found ${fighters.length} matching fighters in DB:`);
  for (const f of fighters) {
    console.log(`- ID: ${f.id} | Name: "${f.name}" | imageUrl: "${f.imageUrl}"`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
