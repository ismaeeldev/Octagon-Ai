import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PredictionEngine } from "@/lib/prediction-engine";
import { scrapeAndSaveFighter } from "@/lib/fighter-scraper";
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Fetch list of fighters for the dropdown selectors
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const isPremium = session?.user?.isPremium === true;

    if (!isPremium) {
      return NextResponse.json({ error: "Premium subscription required" }, { status: 403 });
    }

    const fighters = await prisma.fighter.findMany({
      where: { isActive: true },
      select: { id: true, name: true, weightClass: true },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ fighters });
  } catch (error: any) {
    logger.error("Failed to fetch fighters for matchup", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Generate a hypothetical prediction for two fighters
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isPremium = session?.user?.isPremium === true;

    if (!isPremium) {
      return NextResponse.json({ error: "Premium subscription required" }, { status: 403 });
    }

    const { fighter1Id, fighter2Id } = await req.json();

    if (!fighter1Id || !fighter2Id) {
      return NextResponse.json({ error: "Missing fighter IDs" }, { status: 400 });
    }

    if (fighter1Id === fighter2Id) {
      return NextResponse.json({ error: "Cannot fight themselves" }, { status: 400 });
    }

    let f1 = await prisma.fighter.findUnique({ where: { id: fighter1Id } });
    let f2 = await prisma.fighter.findUnique({ where: { id: fighter2Id } });

    if (!f1 || !f2) {
      return NextResponse.json({ error: "Fighters not found" }, { status: 404 });
    }

    // Trigger on-demand scraper if stats are missing
    const f1NeedsScrape = f1.height === null || f1.reach === null || f1.age === null;
    const f2NeedsScrape = f2.height === null || f2.reach === null || f2.age === null;

    if (f1NeedsScrape || f2NeedsScrape) {
      const promises = [];
      if (f1NeedsScrape) {
        promises.push(
          scrapeAndSaveFighter(f1.id)
            .then(res => { if (res) f1 = res as any; })
            .catch(err => logger.error(`On-demand scrape failed for ${f1?.name}:`, err))
        );
      }
      if (f2NeedsScrape) {
        promises.push(
          scrapeAndSaveFighter(f2.id)
            .then(res => { if (res) f2 = res as any; })
            .catch(err => logger.error(`On-demand scrape failed for ${f2?.name}:`, err))
        );
      }
      await Promise.all(promises);

      // Re-fetch to ensure clean DB records
      f1 = await prisma.fighter.findUnique({ where: { id: fighter1Id } }) || f1;
      f2 = await prisma.fighter.findUnique({ where: { id: fighter2Id } }) || f2;
    }

    const engine = new PredictionEngine();
    const prediction = await engine.generateHypotheticalPrediction(f1, f2);

    return NextResponse.json({
      fighter1: f1,
      fighter2: f2,
      prediction
    });
  } catch (error: any) {
    logger.error("Failed to generate matchup prediction", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
