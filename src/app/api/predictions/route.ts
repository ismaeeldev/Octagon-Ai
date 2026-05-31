import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@/generated/prisma";
import { PredictionEngine } from "@/lib/prediction-engine";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isPremium = session?.user?.isPremium === true;

    if (!isPremium) {
      return NextResponse.json({ error: "Premium subscription required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const weightClass = searchParams.get("weightClass") || "";

    const take = 10;
    const skip = (page - 1) * take;

    // Start of today UTC so past events don't appear in predictions
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // 1. On-demand AI prediction generation for unpredicted fights of UPCOMING events ONLY
    const unpredictedFights = await prisma.fight.findMany({
      where: {
        aiPrediction: null,
        event: { isUpcoming: true, date: { gte: todayStart } }
      },
      include: {
        fighter1: true,
        fighter2: true,
        event: true
      },
      take: 5 // Process a small batch to prevent API timeouts
    });

    if (unpredictedFights.length > 0) {
      const engine = new PredictionEngine();
      for (const fight of unpredictedFights) {
        if (fight.fighter1 && fight.fighter2) {
          try {
            const prediction = await engine.generateHypotheticalPrediction(
              fight.fighter1,
              fight.fighter2,
              fight.event?.date || new Date()
            );

            await prisma.fight.update({
              where: { id: fight.id },
              data: {
                aiPrediction: prediction.summary,
                aiConfidence: prediction.confidenceScore
              }
            });

            await prisma.predictionHistory.create({
              data: {
                fightId: fight.id,
                winProbFighter1: prediction.winProbabilityFighter1,
                winProbFighter2: prediction.winProbabilityFighter2,
                confidence: prediction.confidenceScore,
                explanation: prediction.summary
              }
            });
          } catch (err) {
            console.error(`Failed to generate prediction for fight ${fight.id}:`, err);
          }
        }
      }
    }

    // 2. Fetch predicted fights (strictly UPCOMING events ONLY)
    const where: Prisma.FightWhereInput = {
      aiPrediction: { not: null },
      event: { isUpcoming: true, date: { gte: todayStart } }
    };

    if (search) {
      where.OR = [
        { fighter1: { name: { contains: search, mode: "insensitive" } } },
        { fighter2: { name: { contains: search, mode: "insensitive" } } }
      ];
    }

    if (weightClass) {
      where.weightClass = { contains: weightClass, mode: "insensitive" };
    }

    const totalCount = await prisma.fight.count({ where });

    const fights = await prisma.fight.findMany({
      where,
      include: {
        fighter1: true,
        fighter2: true,
        event: true
      },
      orderBy: { event: { date: 'asc' } },
      take,
      skip
    });

    // Apply Server-Side Premium Protection
    const protectedFights = fights.map(fight => {
      if (!isPremium) {
        return {
          ...fight,
          aiPrediction: "LOCKED_PREMIUM",
          aiConfidence: null
        };
      }
      return fight;
    });

    return NextResponse.json({
      fights: protectedFights,
      totalPages: Math.ceil(totalCount / take),
      currentPage: page,
      isPremium
    });

  } catch (error: any) {
    console.error("Failed to fetch predictions", error);
    return NextResponse.json({ error: "Failed to load predictions" }, { status: 500 });
  }
}

