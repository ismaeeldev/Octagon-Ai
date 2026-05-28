import { PrismaClient } from "../generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import 'dotenv/config';

const adapter = new PrismaNeon({ 
  connectionString: process.env.DATABASE_URL! 
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const totalFighters = await prisma.fighter.count();
  const withImages = await prisma.fighter.count({
    where: {
      imageUrl: { not: null, lte: "" } // check non-null and non-empty
    }
  });
  const withImagesNotEmpty = await prisma.fighter.findMany({
    where: {
      imageUrl: { not: null }
    },
    take: 5
  });

  console.log(`Total fighters in DB: ${totalFighters}`);
  console.log(`Fighters with imageUrl in DB: ${withImagesNotEmpty.length === 0 ? 0 : 'Some'}`);
  console.log("Sample image URLs:");
  for (const f of withImagesNotEmpty) {
    console.log(`- ${f.name}: "${f.imageUrl}"`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
