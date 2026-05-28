import { PrismaClient } from "../generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import 'dotenv/config';

const adapter = new PrismaNeon({ 
  connectionString: process.env.DATABASE_URL! 
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const events = await prisma.event.findMany({
    include: {
      _count: {
        select: { fights: true }
      },
      fights: {
        include: {
          fighter1: true,
          fighter2: true
        },
        take: 1
      }
    }
  });

  const withFights = events.filter(e => e._count.fights > 0);
  console.log(`Total events with fights in DB: ${withFights.length}`);
  for (const e of withFights) {
    const f = e.fights[0];
    console.log(`- Event: "${e.name}" | fights: ${e._count.fights}`);
    console.log(`  Headline: "${f.fighter1.name}" (img: ${f.fighter1.imageUrl}) vs "${f.fighter2.name}" (img: ${f.fighter2.imageUrl})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
