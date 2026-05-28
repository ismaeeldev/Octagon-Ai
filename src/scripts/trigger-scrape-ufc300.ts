import 'dotenv/config';
import { PrismaClient } from "../generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { FightCardScraper } from "../scrapers/fight-card-scraper";
import { scrapeAndSaveFighter } from "../app/api/fighters/[id]/details/route";

const adapter = new PrismaNeon({ 
  connectionString: process.env.DATABASE_URL! 
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const eventId = "a4643c34-186b-4295-b101-a2f73fef20ac"; // UFC 300
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  
  if (!event) {
    console.error("UFC 300 event not found in DB!");
    return;
  }

  console.log(`Simulating view for: ${event.name}`);
  const match = event.name.match(/UFC\s(\d+)/i);
  const urlSlug = match ? `ufc-${match[1]}` : event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const eventUrl = `https://www.ufc.com/event/${urlSlug}`;
  
  console.log(`Target URL: ${eventUrl}`);
  
  const scraper = new FightCardScraper(eventUrl, event.id, false);
  const fights = await scraper.run();
  console.log(`Scraped fights count: ${fights.length}`);
  
  if (fights.length > 0) {
    // Let's refetch from DB to see the saved fighters
    const refreshed = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        fights: {
          include: {
            fighter1: true,
            fighter2: true
          }
        }
      }
    });
    
    const mainFight = refreshed?.fights[0];
    if (mainFight) {
      console.log("Scraped headline:", mainFight.fighter1.name, "vs", mainFight.fighter2.name);
      
      // Let's try scraping their images
      console.log(`Scraping details for: ${mainFight.fighter1.name}...`);
      const details1 = await scrapeAndSaveFighter(mainFight.fighter1Id);
      console.log(`Fighter 1 img:`, details1.imageUrl);
      
      console.log(`Scraping details for: ${mainFight.fighter2.name}...`);
      const details2 = await scrapeAndSaveFighter(mainFight.fighter2Id);
      console.log(`Fighter 2 img:`, details2.imageUrl);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
