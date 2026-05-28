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
      name: {
        in: ["Alex Pereira", "Jamahal Hill", "Justin Gaethje", "Max Holloway"]
      }
    }
  });

  for (const f of fighters) {
    console.log(`- ${f.name}: imageUrl="${f.imageUrl}"`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
