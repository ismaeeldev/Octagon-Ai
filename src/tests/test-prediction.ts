import "dotenv/config";
import { prisma } from "@/lib/db";
import { PredictionEngine } from "@/lib/prediction-engine";
import { logger } from "@/lib/logger";

async function runTest() {
  logger.info("=== Starting Prediction Engine Test ===");

  // 1. Find a fight to predict
  // Prefer an upcoming fight if available, otherwise just any fight
  let fight = await prisma.fight.findFirst({
    where: { 
      event: { isUpcoming: true }
    },
    include: { fighter1: true, fighter2: true, event: true }
  });

  if (!fight) {
    fight = await prisma.fight.findFirst({
      include: { fighter1: true, fighter2: true, event: true }
    });
  }

  if (!fight) {
    logger.error("No fights found in DB to predict.");
    process.exit(1);
  }

  logger.info(`Selected Fight: ${fight.fighter1.name} vs ${fight.fighter2.name} at ${fight.event.name}`);

  // 2. Generate Prediction
  const engine = new PredictionEngine();
  const prediction = await engine.generatePrediction(fight.id);

  logger.info("\n=== PREDICTION RESULTS ===");
  logger.info(`Fighter 1 (${fight.fighter1.name}): ${prediction.winProbabilityFighter1}%`);
  logger.info(`Fighter 2 (${fight.fighter2.name}): ${prediction.winProbabilityFighter2}%`);
  logger.info(`Confidence Score: ${(prediction.confidenceScore * 100).toFixed(0)}%`);
  logger.info(`Summary: ${prediction.summary}`);
  logger.info("==========================\n");

  // 3. Save to DB
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
  
  logger.info("Prediction successfully saved to database and PredictionHistory.");

  await prisma.$disconnect();
}

runTest().catch(e => {
  console.error(e);
  process.exit(1);
});
