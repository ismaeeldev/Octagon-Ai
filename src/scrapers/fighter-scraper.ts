import { BaseScraper } from "./base-scraper";
import { logger } from "@/lib/logger";
import { ParsingError } from "@/lib/scraper-error";
import { prisma } from "@/lib/db";
import * as cheerio from "cheerio";

// 1. Define Data Structures
export interface RawFighter {
  name: string;
  age?: number | string;
  height?: number | string;
  reach?: number | string;
  weightClass?: string;
  wins: number | string;
  losses: number | string;
  draws: number | string;
  imageUrl?: string | null;
}

export interface ParsedFighter {
  name: string;
  age: number | null;
  height: number | null;
  reach: number | null;
  weightClass: string | null;
  wins: number;
  losses: number;
  draws: number;
  imageUrl: string | null;
}

// 2. Generate 90 Mock Fighters (Simulating 10 fighters retiring/becoming inactive)
function generateMockFighters(): RawFighter[] {
  const firstNames = ["Jon", "Conor", "Khabib", "Islam", "Leon", "Kamaru", "Israel", "Alex", "Max", "Ilia"];
  const lastNames = ["Jones", "McGregor", "Nurmagomedov", "Makhachev", "Edwards", "Usman", "Adesanya", "Pereira", "Holloway", "Topuria"];
  const weightClasses = ["Heavyweight", "Light Heavyweight", "Middleweight", "Welterweight", "Lightweight", "Featherweight", "Bantamweight", "Flyweight"];

  const fighters: RawFighter[] = [];

  // Generating only 90 instead of 100 so the archiving logic can catch the 10 missing fighters
  for (let i = 0; i < 90; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / 10) % lastNames.length];

    // Add a suffix to ensure uniqueness for all 100 since there are only 10x10 combinations
    const uniqueName = `${firstName} ${lastName} ${i > 0 ? `Mk${i}` : ''}`.trim();

    fighters.push({
      name: uniqueName,
      age: 20 + (i % 20),
      height: 60 + (i % 20), // inches
      reach: 65 + (i % 20), // inches
      weightClass: weightClasses[i % weightClasses.length],
      wins: 10 + (i % 15),
      losses: i % 5,
      draws: i % 2,
      imageUrl: null,
    });
  }

  return fighters;
}

export class FighterScraper extends BaseScraper<ParsedFighter[]> {
  private useMock: boolean;

  constructor(useMock: boolean = true) {
    super("FighterScraper", { maxRetries: 3, delayBetweenRequestsMs: 1000, timeoutMs: 30000 });
    this.useMock = useMock;
  }

  protected async execute(): Promise<ParsedFighter[]> {
    logger.info(`[${this.scraperName}] Starting execution. Mock mode: ${this.useMock}`);

    // A. Fetch
    const rawData = await this.fetchData();

    // B. Parse & Validate
    const parsedFighters: ParsedFighter[] = [];
    for (const raw of rawData) {
      try {
        const parsed = this.parse(raw);
        this.validate(parsed);
        parsedFighters.push(parsed);
      } catch (error) {
        logger.warn(`[${this.scraperName}] Skipping invalid fighter: ${raw.name}`, { error });
      }
    }

    // C. Store in Database with Deduplication & Archiving
    await this.saveToDatabase(parsedFighters);

    return parsedFighters;
  }

  private async fetchData(): Promise<RawFighter[]> {
    if (this.useMock) {
      logger.debug(`[${this.scraperName}] Generating 90 mock fighters (to trigger archiving of 10).`);
      await this.sleep(500); // Simulate network
      return generateMockFighters();
    }

    logger.info(`[${this.scraperName}] Starting live scraping of UFC athletes...`);
    const fighters: RawFighter[] = [];
    let page = 0;
    let hasMore = true;
    const maxPages = 400; // Safeguard to prevent infinite loops

    while (hasMore && page < maxPages) {
      const url = `https://www.ufc.com/athletes/all?page=${page}`;
      logger.info(`[${this.scraperName}] Fetching page ${page}: ${url}`);

      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(this.timeoutMs),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const elements = $(".c-listing-athlete-flipcard");

        if (elements.length === 0) {
          logger.info(`[${this.scraperName}] No athletes found on page ${page}. Stopping pagination.`);
          hasMore = false;
          break;
        }

        logger.info(`[${this.scraperName}] Found ${elements.length} athletes on page ${page}`);

        elements.each((_, el) => {
          const nameEl = $(el).find(".c-listing-athlete__name").first();
          if (!nameEl.length) return;

          const name = nameEl.text().trim().replace(/\s+/g, " ");
          const weightClass = $(el).find(".c-listing-athlete__title .field__item").text().trim() ||
            $(el).find(".c-listing-athlete__title").text().trim();
          const recordText = $(el).find(".c-listing-athlete__record").text().trim();

          let wins = "0";
          let losses = "0";
          let draws = "0";

          if (recordText) {
            const match = recordText.match(/(\d+)-(\d+)-(\d+)/);
            if (match) {
              wins = match[1];
              losses = match[2];
              draws = match[3];
            }
          }

          const imgNode = $(el).find(".c-listing-athlete__thumbnail img");
          let imgUrl = imgNode.attr("src") || imgNode.attr("data-src") || null;

          if (imgUrl && imgUrl.includes("no-profile-image")) {
            imgUrl = null;
          }

          if (imgUrl && imgUrl.startsWith("/")) {
            imgUrl = `https://www.ufc.com${imgUrl}`;
          }

          fighters.push({
            name,
            weightClass: weightClass || undefined,
            wins,
            losses,
            draws,
            imageUrl: imgUrl,
          });
        });

        page++;
        // Polite delay between requests
        await this.sleep(this.delayBetweenRequestsMs);
      } catch (error) {
        logger.error(`[${this.scraperName}] Error scraping page ${page}`, error);
        throw error;
      }
    }

    logger.info(`[${this.scraperName}] Live scraping completed. Total fighters fetched: ${fighters.length}`);
    return fighters;
  }

  private parse(raw: RawFighter): ParsedFighter {
    if (!raw.name) {
      throw new ParsingError("Missing required field: name");
    }

    const parseNumber = (val: any): number | null => {
      if (val === undefined || val === null || val === "") return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    };

    return {
      name: raw.name.trim(),
      age: parseNumber(raw.age),
      height: parseNumber(raw.height),
      reach: parseNumber(raw.reach),
      weightClass: raw.weightClass ? raw.weightClass.trim() : null,
      wins: parseNumber(raw.wins) ?? 0,
      losses: parseNumber(raw.losses) ?? 0,
      draws: parseNumber(raw.draws) ?? 0,
      imageUrl: raw.imageUrl ? raw.imageUrl.trim() : null,
    };
  }

  private validate(parsed: ParsedFighter): void {
    if (parsed.name.length < 2) {
      throw new ParsingError(`Fighter name too short: ${parsed.name}`);
    }
    if (parsed.wins < 0 || parsed.losses < 0 || parsed.draws < 0) {
      throw new ParsingError(`Fighter records cannot be negative: ${parsed.name}`);
    }
  }

  private async saveToDatabase(fighters: ParsedFighter[]): Promise<void> {
    logger.info(`[${this.scraperName}] Upserting ${fighters.length} fighters to database in batches...`);

    const scrapedNames = new Set<string>();
    const batchSize = 10;

    for (let i = 0; i < fighters.length; i += batchSize) {
      const batch = fighters.slice(i, i + batchSize);
      const upsertOperations = [];

      for (const fighter of batch) {
        scrapedNames.add(fighter.name);
        upsertOperations.push(
          prisma.fighter.upsert({
            where: { name: fighter.name },
            update: {
              age: fighter.age,
              height: fighter.height,
              reach: fighter.reach,
              weightClass: fighter.weightClass,
              wins: fighter.wins,
              losses: fighter.losses,
              draws: fighter.draws,
              imageUrl: fighter.imageUrl,
              isActive: true,
            },
            create: {
              name: fighter.name,
              age: fighter.age,
              height: fighter.height,
              reach: fighter.reach,
              weightClass: fighter.weightClass,
              wins: fighter.wins,
              losses: fighter.losses,
              draws: fighter.draws,
              imageUrl: fighter.imageUrl,
              isActive: true,
            }
          })
        );
      }

      try {
        logger.info(`[${this.scraperName}] Saving batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(fighters.length / batchSize)}...`);
        await Promise.all(upsertOperations);
      } catch (error) {
        logger.error(`[${this.scraperName}] Failed to upsert batch starting at index ${i}`, error);
        throw error;
      }
    }

    logger.info(`[${this.scraperName}] Successfully saved/updated all ${fighters.length} fighters.`);

    // Archiving Step
    logger.info(`[${this.scraperName}] Archiving missing fighters...`);
    try {
      const result = await prisma.fighter.updateMany({
        where: {
          isActive: true,
          name: { notIn: Array.from(scrapedNames) }
        },
        data: { isActive: false }
      });

      if (result.count > 0) {
        logger.info(`[${this.scraperName}] Archived ${result.count} inactive fighters.`);
      }
    } catch (error) {
      logger.error(`[${this.scraperName}] Failed to archive missing fighters`, error);
    }
  }
}
