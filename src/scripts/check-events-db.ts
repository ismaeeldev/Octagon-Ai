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
      }
    },
    orderBy: { date: 'desc' }
  });

  console.log("Total events in DB:", events.length);
  for (const e of events) {
    console.log(`- ${e.name} (${e.isUpcoming ? 'UPCOMING' : 'PAST'}) | Date: ${e.date.toISOString()} | Fights: ${e._count.fights} | ID: ${e.id}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
