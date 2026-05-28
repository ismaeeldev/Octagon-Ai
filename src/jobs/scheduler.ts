import { logger } from "@/lib/logger";
import { JobRunner } from "./job-runner";
import { ScraperManager } from "./scraper-manager";
import { UfcEventScraper } from "../scrapers/ufc-event-scraper";
import { FightCardScraper } from "../scrapers/fight-card-scraper";
import { FighterScraper } from "../scrapers/fighter-scraper";
import { prisma } from "@/lib/db";

export class Scheduler {
  public async syncEvents() {
    await JobRunner.run("SyncEvents", async () => {
      logger.info("[Jobs] Executing Sync Events...");
      const manager = new ScraperManager();
      manager.register(new UfcEventScraper(false));
      await manager.runAllSequentially();

      const eventsToSync = await prisma.event.findMany({
        where: {
          OR: [
            { isUpcoming: true },
            {
              isUpcoming: false,
              fights: { none: {} }
            }
          ]
        },
        orderBy: { date: 'asc' },
        take: 5
      });

      const fightCardManager = new ScraperManager();
      for (const event of eventsToSync) {
        const match = event.name.match(/UFC\s(\d+)/i);
        const urlSlug = match ? `ufc-${match[1]}` : event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const eventUrl = `https://www.ufc.com/event/${urlSlug}`;
        fightCardManager.register(new FightCardScraper(eventUrl, event.id, false));
      }
      
      if (eventsToSync.length > 0) {
        await fightCardManager.runAllSequentially();
      }
      logger.info("[Jobs] Sync Events completed.");
    });
  }

  public async syncFighters() {
    await JobRunner.run("SyncFighters", async () => {
      logger.info("[Jobs] Executing Sync Fighters...");
      const manager = new ScraperManager();
      manager.register(new FighterScraper(false)); // Switched to use REAL data
      await manager.runAllSequentially();
      logger.info("[Jobs] Sync Fighters completed.");
    });
  }

  public async processResults() {
    await JobRunner.run("ProcessResults", async () => {
      logger.info("[Jobs] Executing Process Results... (Placeholder)");
      await new Promise(resolve => setTimeout(resolve, 1500));
      logger.info("[Jobs] Process Results completed.");
    });
  }

  public async triggerManual(jobType: 'daily' | 'weekly' | 'events' | 'fighters' | 'results') {
    logger.info(`[Scheduler] MANUAL TRIGGER executing ${jobType} jobs...`);
    if (jobType === 'events' || jobType === 'daily') {
      await this.syncEvents();
    } else if (jobType === 'fighters' || jobType === 'weekly') {
      await this.syncFighters();
    } else if (jobType === 'results') {
      await this.processResults();
    }
  }
}
