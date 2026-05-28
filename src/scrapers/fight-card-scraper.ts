import { BaseScraper } from "./base-scraper";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db";
import { UfcSourceAdapter } from "./adapters/ufc-source-adapter";
import { UfcFightParser } from "./parsers/ufc-fight-parser";
import { UfcFightValidator } from "./validators/ufc-fight-validator";

export interface RawFight {
  eventId: string;
  fighter1Name: string;
  fighter2Name: string;
  weightClass?: string;
  isMainCard?: boolean;
  isTitleFight?: boolean;
  winnerName?: string | null;
  method?: string | null;
  endingRound?: number | null;
  endingTime?: string | null;
}

export interface ParsedFight {
  eventId: string;
  fighter1Name: string;
  fighter2Name: string;
  weightClass: string | null;
  isMainCard: boolean;
  isTitleFight: boolean;
  winnerName: string | null;
  method: string | null;
  endingRound: number | null;
  endingTime: string | null;
}

export class FightCardScraper extends BaseScraper<ParsedFight[]> {
  private useMock: boolean;
  private eventUrl: string;
  private eventId: string;
  private adapter: UfcSourceAdapter;
  private parser: UfcFightParser;
  private validator: UfcFightValidator;

  constructor(eventUrl: string, eventId: string, useMock: boolean = false) {
    super(`FightCardScraper-${eventId}`, { maxRetries: 2, delayBetweenRequestsMs: 1500 });
    this.eventUrl = eventUrl;
    this.eventId = eventId;
    this.useMock = useMock;
    this.adapter = new UfcSourceAdapter();
    this.parser = new UfcFightParser();
    this.validator = new UfcFightValidator();
  }

  protected async execute(): Promise<ParsedFight[]> {
    logger.info(`[${this.scraperName}] Fetching fight card from ${this.eventUrl}`);

    let rawData: RawFight[] = [];

    // A. Fetch & Parse
    try {
      if (this.useMock) {
        rawData = this.getMockData();
      } else {
        const html = await this.adapter.fetchHtml(this.eventUrl);
        rawData = this.parser.parse(html, this.eventId);
      }
    } catch (error) {
      logger.error(`[${this.scraperName}] Failed to fetch or parse fights`, error);
      throw error;
    }

    if (rawData.length === 0) {
      logger.warn(`[${this.scraperName}] Found 0 fights on the card.`);
      return [];
    }

    // B. Validate
    const parsedFights: ParsedFight[] = [];
    for (const raw of rawData) {
      try {
        const parsed = this.validator.validateAndTransform(raw);
        parsedFights.push(parsed);
      } catch (error) {
        logger.warn(`[${this.scraperName}] Invalid fight data skipped`, { error });
      }
    }

    // C. Store & Link Fighters
    await this.saveToDatabase(parsedFights);

    return parsedFights;
  }

  private async saveToDatabase(fights: ParsedFight[]): Promise<void> {
    logger.info(`[${this.scraperName}] Saving ${fights.length} fights to DB sequentially...`);
    
    // Deduplicate parsed fights by combination of fighter names
    const uniqueFightsMap = new Map<string, ParsedFight>();
    for (const fight of fights) {
      const key = `${fight.fighter1Name}_${fight.fighter2Name}`;
      const reverseKey = `${fight.fighter2Name}_${fight.fighter1Name}`;
      if (!uniqueFightsMap.has(key) && !uniqueFightsMap.has(reverseKey)) {
        uniqueFightsMap.set(key, fight);
      }
    }
    const uniqueFights = Array.from(uniqueFightsMap.values());
    logger.info(`[${this.scraperName}] Deduplicated to ${uniqueFights.length} unique fights.`);

    // 1. Upsert All Fighters first to prevent duplicates/missing constraints
    const fighterMap = new Map<string, string | null>();
    for (const fight of uniqueFights) {
      fighterMap.set(fight.fighter1Name, fight.weightClass);
      fighterMap.set(fight.fighter2Name, fight.weightClass);
    }

    for (const [name, weightClass] of fighterMap.entries()) {
      try {
        await prisma.fighter.upsert({
          where: { name },
          update: {},
          create: { name, weightClass }
        });
      } catch (error) {
        logger.error(`[${this.scraperName}] Failed to upsert fighter: ${name}`, error);
      }
    }

    // 2. Fetch all fighters to get their IDs
    const dbFighters = await prisma.fighter.findMany({
      where: { name: { in: Array.from(fighterMap.keys()) } }
    });
    const fighterIdMap = new Map(dbFighters.map(f => [f.name, f.id]));

    // 3. Fetch all existing fights for this event to avoid N sequential findFirst
    const existingFights = await prisma.fight.findMany({
      where: { eventId: this.eventId }
    });
    
    // Map by f1_f2 combination
    const existingFightMap = new Map(
      existingFights.map(f => [`${f.fighter1Id}_${f.fighter2Id}`, f.id])
    );

    // 4. Update/Create Fights sequentially
    let processedCount = 0;

    for (const fight of uniqueFights) {
      const f1Id = fighterIdMap.get(fight.fighter1Name);
      const f2Id = fighterIdMap.get(fight.fighter2Name);

      if (!f1Id || !f2Id) {
        logger.warn(`[${this.scraperName}] Missing fighter ID for ${fight.fighter1Name} or ${fight.fighter2Name}`);
        continue;
      }

      let winnerId = null;
      if (fight.winnerName) {
        winnerId = fighterIdMap.get(fight.winnerName) || null;
      }

      const key = `${f1Id}_${f2Id}`;
      const existingFightId = existingFightMap.get(key);

      try {
        if (existingFightId) {
          await prisma.fight.update({
            where: { id: existingFightId },
            data: {
              weightClass: fight.weightClass,
              isTitleFight: fight.isTitleFight,
              winnerId: winnerId,
              method: fight.method,
              endingRound: fight.endingRound,
              endingTime: fight.endingTime,
            }
          });
        } else {
          await prisma.fight.create({
            data: {
              eventId: fight.eventId,
              fighter1Id: f1Id,
              fighter2Id: f2Id,
              weightClass: fight.weightClass,
              isTitleFight: fight.isTitleFight,
              winnerId: winnerId,
              method: fight.method,
              endingRound: fight.endingRound,
              endingTime: fight.endingTime,
            }
          });
        }
        processedCount++;
      } catch (error) {
        logger.error(`[${this.scraperName}] Failed to save fight record: ${fight.fighter1Name} vs ${fight.fighter2Name}`, error);
      }
    }

    logger.info(`[${this.scraperName}] Successfully saved/updated ${processedCount} fights.`);
  }

  private getMockData(): RawFight[] {
    return [
      {
        eventId: this.eventId,
        fighter1Name: "Islam Makhachev",
        fighter2Name: "Dustin Poirier",
        weightClass: "Lightweight Title Bout",
        isMainCard: true,
        isTitleFight: true
      },
      {
        eventId: this.eventId,
        fighter1Name: "Sean Strickland",
        fighter2Name: "Paulo Costa",
        weightClass: "Middleweight Bout",
        isMainCard: true,
        isTitleFight: false
      }
    ];
  }
}
