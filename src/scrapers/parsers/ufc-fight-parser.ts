import * as cheerio from "cheerio";
import { RawFight } from "../fight-card-scraper";
import { logger } from "@/lib/logger";

export class UfcFightParser {
  public parse(html: string, eventId: string): RawFight[] {
    const $ = cheerio.load(html);
    const fights: RawFight[] = [];

    // On UFC event pages, fights are usually listed inside .c-listing-fight or similar.
    // We'll search generically for fight listings.
    const fightCards = $('.c-listing-fight, .fight-card, li.l-listing__item, .c-listing-fight__content');
    
    logger.debug(`[UfcFightParser] Found ${fightCards.length} potential fights in HTML`);

    fightCards.each((i, el) => {
      const $el = $(el);
      
      const fighter1Name = $el.find('.c-listing-fight__corner-name--red').text().trim().replace(/\s+/g, ' ') || $el.find('.details-content__name--red').text().trim().replace(/\s+/g, ' ');
      const fighter2Name = $el.find('.c-listing-fight__corner-name--blue').text().trim().replace(/\s+/g, ' ') || $el.find('.details-content__name--blue').text().trim().replace(/\s+/g, ' ');
      const weightClass = $el.find('.c-listing-fight__class-text, .c-listing-fight__class, .weight-class').first().text().trim();
      
      // Heuristic: Is it main card?
      const isMainCard = $el.closest('.main-card, #main-card, .c-listing-fight--main-card').length > 0;
      // Heuristic: Is it title fight?
      const isTitleFight = $el.find('.c-listing-fight__title-bout, .title-bout').length > 0 || weightClass.toLowerCase().includes('title');

      if (fighter1Name && fighter2Name && fighter1Name !== fighter2Name) {
        // Determine winner
        const f1Won = $el.find('.c-listing-fight__corner--red .c-listing-fight__outcome--win').length > 0;
        const f2Won = $el.find('.c-listing-fight__corner--blue .c-listing-fight__outcome--win').length > 0;
        
        let winnerName: string | null = null;
        if (f1Won) winnerName = fighter1Name;
        if (f2Won) winnerName = fighter2Name;

        // Get ending details
        let method: string | null = null;
        let endingRound: number | null = null;
        let endingTime: string | null = null;

        $el.find('.c-listing-fight__result').each((_, resEl) => {
          const label = $(resEl).find('.c-listing-fight__result-label').text().trim().toLowerCase();
          const val = $(resEl).find('.c-listing-fight__result-text').text().trim();
          if (label === 'method') method = val;
          if (label === 'round') endingRound = parseInt(val, 10) || null;
          if (label === 'time') endingTime = val;
        });

        fights.push({
          eventId,
          fighter1Name,
          fighter2Name,
          weightClass: weightClass || "Catchweight",
          isMainCard,
          isTitleFight,
          winnerName,
          method,
          endingRound,
          endingTime
        });
      }
    });

    // Fallback: Mock generation if HTML structure drastically changed but we need to demonstrate UI sync
    if (fights.length === 0) {
      logger.warn("[UfcFightParser] Could not find specific fight classes. Attempting fallback text parsing...");
      
      // Look for " vs " or " vs. " in strong tags or h4s
      $('h4, h3, strong').each((i, el) => {
        const text = $(el).text().trim();
        if (text.toLowerCase().includes(' vs ') || text.toLowerCase().includes(' vs. ')) {
          const parts = text.split(/ vs\.? /i);
          if (parts.length === 2 && parts[0].length > 2 && parts[1].length > 2) {
             fights.push({
               eventId,
               fighter1Name: parts[0].trim(),
               fighter2Name: parts[1].trim(),
               weightClass: "TBD",
               isMainCard: i < 5, // Top 5 fights usually main card
               isTitleFight: false,
             });
          }
        }
      });
    }

    return fights;
  }
}
