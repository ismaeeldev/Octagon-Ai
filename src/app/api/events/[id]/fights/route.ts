import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { FightCardScraper } from "@/scrapers/fight-card-scraper";
import { scrapeAndSaveFighter } from "@/lib/fighter-scraper";

export const maxDuration = 300;

// Helper: check if a fighter image is valid (not null, "null", "undefined", empty)
function needsImageScrape(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return true;
  const trimmed = imageUrl.trim();
  return !trimmed || trimmed === "null" || trimmed === "undefined" || trimmed === "N/A";
}

// Helper: generate UFC event URL slug from event name
function generateEventSlug(eventName: string): string {
  // "UFC 300: Pereira vs. Hill" → "ufc-300"
  const numberedMatch = eventName.match(/UFC\s+(\d+)/i);
  if (numberedMatch) {
    return `ufc-${numberedMatch[1]}`;
  }

  // "UFC Freedom 250" → "ufc-freedom-250"  
  const ufcNamedMatch = eventName.match(/^UFC\s+(.+)/i);
  if (ufcNamedMatch) {
    return `ufc-${ufcNamedMatch[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`;
  }

  // "Chimaev vs Strickland" → "ufc-fight-night-chimaev-vs-strickland"
  const vsMatch = eventName.match(/(.+?)\s+vs\.?\s+(.+)/i);
  if (vsMatch) {
    const f1Last = vsMatch[1].trim().split(/\s+/).pop()?.toLowerCase() || '';
    const f2Last = vsMatch[2].trim().split(/\s+/).pop()?.toLowerCase() || '';
    return `ufc-fight-night-${f1Last}-vs-${f2Last}`;
  }

  // Fallback: slugify the whole name
  return eventName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
}

// Shared include for fights query
const FIGHTS_INCLUDE = {
  fights: {
    include: {
      fighter1: true,
      fighter2: true
    },
    orderBy: [
      { isTitleFight: 'desc' as const }
    ]
  }
};

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    // 1. Fetch event and fights
    const event = await prisma.event.findUnique({
      where: { id },
      include: FIGHTS_INCLUDE
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // 2. Dynamic scraping if no fights exist yet
    if (event.fights.length === 0) {
      const urlSlug = generateEventSlug(event.name);
      const eventUrl = `https://www.ufc.com/event/${urlSlug}`;

      try {
        const scraper = new FightCardScraper(eventUrl, event.id, false);
        await scraper.run();

        // Re-fetch to get scraped fights
        const refreshedEvent = await prisma.event.findUnique({
          where: { id },
          include: FIGHTS_INCLUDE
        });

        if (refreshedEvent && refreshedEvent.fights.length > 0) {
          // Scrape images for main event fighters (use DB fallback if already saved)
          await scrapeMainFighterImages(refreshedEvent.fights);

          // Final fetch with updated images
          const finalEvent = await prisma.event.findUnique({
            where: { id },
            include: FIGHTS_INCLUDE
          });

          return NextResponse.json({
            fights: finalEvent?.fights || refreshedEvent.fights,
            isUpcoming: event.isUpcoming
          });
        }

        // Fallback: If no fights scraped or saved, extract from event name and fetch from DB
        const fallback = await getFallbackFightersFromEventName(event.name);
        if (fallback) {
          return NextResponse.json({
            fights: [{
              id: "fallback-fight",
              eventId: event.id,
              fighter1: fallback.fighter1,
              fighter2: fallback.fighter2,
              isTitleFight: event.name.toLowerCase().includes("title") || event.name.toLowerCase().includes("championship"),
              weightClass: "TBD"
            }],
            isUpcoming: event.isUpcoming
          });
        }

        return NextResponse.json({
          fights: refreshedEvent?.fights || [],
          isUpcoming: event.isUpcoming
        });
      } catch (scrapeError) {
        console.error(`Failed to scrape live fights for event ${event.name}:`, scrapeError);
      }
    } else {
      // 3. Fights exist — scrape images for fighters that are still missing them
      await scrapeMainFighterImages(event.fights);

      // Re-fetch to include updated images
      const refreshedEvent = await prisma.event.findUnique({
        where: { id },
        include: FIGHTS_INCLUDE
      });

      if (refreshedEvent) {
        return NextResponse.json({
          fights: refreshedEvent.fights,
          isUpcoming: event.isUpcoming
        });
      }
    }

    // Fallback: Even if DB fights query was not 0, if there are no fights but we can extract them
    if (event.fights.length === 0) {
      const fallback = await getFallbackFightersFromEventName(event.name);
      if (fallback) {
        return NextResponse.json({
          fights: [{
            id: "fallback-fight",
            eventId: event.id,
            fighter1: fallback.fighter1,
            fighter2: fallback.fighter2,
            isTitleFight: event.name.toLowerCase().includes("title") || event.name.toLowerCase().includes("championship"),
            weightClass: "TBD"
          }],
          isUpcoming: event.isUpcoming
        });
      }
    }

    return NextResponse.json({
      fights: event.fights,
      isUpcoming: event.isUpcoming
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getFallbackFightersFromEventName(eventName: string) {
  // Try to split by " vs. " or " vs "
  const match = eventName.match(/(.+?)\s+vs\.?\s+(.+)/i);
  if (!match) return null;

  // Extract fighter 1's search string (clean up "UFC 300: " prefix if present)
  let f1Part = match[1].trim();
  if (f1Part.includes(":")) {
    f1Part = f1Part.split(":").pop()!.trim();
  }
  const f1LastName = f1Part.split(/\s+/).pop()?.trim();

  // Extract fighter 2's search string
  const f2Part = match[2].trim();
  const f2LastName = f2Part.split(/\s+/)[0]?.trim();

  if (!f1LastName || !f2LastName) return null;

  // Look them up in the DB
  const [f1, f2] = await Promise.all([
    prisma.fighter.findFirst({
      where: {
        name: {
          endsWith: f1LastName,
          mode: "insensitive"
        }
      }
    }),
    prisma.fighter.findFirst({
      where: {
        name: {
          startsWith: f2LastName,
          mode: "insensitive"
        }
      }
    })
  ]);

  let fighter1 = f1;
  let fighter2 = f2;

  if (!fighter1) {
    fighter1 = await prisma.fighter.findFirst({
      where: { name: { contains: f1LastName, mode: "insensitive" } }
    });
  }
  if (!fighter2) {
    fighter2 = await prisma.fighter.findFirst({
      where: { name: { contains: f2LastName, mode: "insensitive" } }
    });
  }

  if (fighter1 && fighter2) {
    return { fighter1, fighter2 };
  }
  return null;
}

/**
 * Scrape images for main event fighters that are missing images.
 * Uses the DB-stored imageUrl as fallback (scrapeAndSaveFighter preserves existing values).
 * Only scrapes the main event (first fight) to keep response fast.
 */
async function scrapeMainFighterImages(fights: any[]) {
  if (fights.length === 0) return;

  const mainFight = fights[0];
  if (!mainFight) return;

  const promises: Promise<any>[] = [];

  // Only scrape if the fighter needs an image
  if (needsImageScrape(mainFight.fighter1?.imageUrl)) {
    promises.push(
      scrapeAndSaveFighter(mainFight.fighter1Id).catch(err =>
        console.error(`Image scrape failed for fighter1:`, err)
      )
    );
  }

  if (needsImageScrape(mainFight.fighter2?.imageUrl)) {
    promises.push(
      scrapeAndSaveFighter(mainFight.fighter2Id).catch(err =>
        console.error(`Image scrape failed for fighter2:`, err)
      )
    );
  }

  if (promises.length > 0) {
    await Promise.all(promises);
  }
}
