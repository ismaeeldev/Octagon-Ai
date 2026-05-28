import { RawFight, ParsedFight } from "../fight-card-scraper";
import { ParsingError } from "@/lib/scraper-error";

export class UfcFightValidator {
  public validateAndTransform(raw: RawFight): ParsedFight {
    if (!raw.eventId) {
      throw new ParsingError("Missing eventId for fight.");
    }
    if (!raw.fighter1Name || !raw.fighter2Name) {
      throw new ParsingError("Missing fighter names for fight.");
    }

    // Normalize strings: Title Case and trim
    const normalize = (name: string) => {
      return name.trim().replace(/\s+/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    const fighter1 = normalize(raw.fighter1Name);
    const fighter2 = normalize(raw.fighter2Name);

    if (fighter1.length < 3 || fighter2.length < 3) {
      throw new ParsingError(`Fighter name too short: ${fighter1} vs ${fighter2}`);
    }

    // Reject extremely long names or names with too many words (prevents scraping concatenated pages/tables)
    const f1WordCount = fighter1.split(' ').length;
    const f2WordCount = fighter2.split(' ').length;
    if (f1WordCount > 5 || f2WordCount > 5 || fighter1.length > 45 || fighter2.length > 45) {
      throw new ParsingError(`Fighter name format is invalid (too long or too many words): ${fighter1} vs ${fighter2}`);
    }

    if (fighter1 === fighter2) {
      throw new ParsingError(`A fighter cannot fight themselves: ${fighter1}`);
    }

    return {
      eventId: raw.eventId,
      fighter1Name: fighter1,
      fighter2Name: fighter2,
      weightClass: raw.weightClass ? raw.weightClass.trim() : null,
      isMainCard: raw.isMainCard || false,
      isTitleFight: raw.isTitleFight || false,
      winnerName: raw.winnerName ? normalize(raw.winnerName) : null,
      method: raw.method ? raw.method.trim() : null,
      endingRound: raw.endingRound || null,
      endingTime: raw.endingTime ? raw.endingTime.trim() : null,
    };
  }
}
