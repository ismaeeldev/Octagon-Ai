import "dotenv/config";
import { Scheduler } from "../jobs/scheduler";
import { logger } from "../lib/logger";

async function main() {
  logger.info("Booting up CageMind AI Background Scheduler...");

  const scheduler = new Scheduler();

  // Start the background cron daemon
  scheduler.start();

  // Handle graceful shutdown
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received. Shutting down scheduler gracefully.");
    scheduler.stop();
    process.exit(0);
  });

  process.on("SIGINT", () => {
    logger.info("SIGINT received. Shutting down scheduler gracefully.");
    scheduler.stop();
    process.exit(0);
  });

  // For testing purposes, if an argument is passed, run a manual trigger immediately
  const args = process.argv.slice(2);
  if (args.includes("--trigger-daily")) {
    await scheduler.triggerManual("daily");
  }
  if (args.includes("--trigger-weekly")) {
    await scheduler.triggerManual("weekly");
  }

  // Keep process alive since node-cron runs in the event loop
}

main().catch((error) => {
  logger.error("Fatal error booting scheduler", error);
  process.exit(1);
});
