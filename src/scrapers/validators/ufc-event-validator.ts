import { ParsedUfcEvent, RawUfcEvent } from "../ufc-event-scraper";
import { ParsingError } from "@/lib/scraper-error";

export class UfcEventValidator {
  public validateAndTransform(raw: RawUfcEvent): ParsedUfcEvent {
    if (!raw.title) {
      throw new ParsingError("Missing required field: title");
    }

    if (!raw.eventDate) {
      throw new ParsingError(`Missing eventDate for event: ${raw.title}`);
    }

    // Attempt to parse the date. Cheerio might give us a timestamp string or a formatted string.
    let parsedDate = new Date(raw.eventDate);
    
    // If it's a unix timestamp string (e.g. "1712312312")
    if (isNaN(parsedDate.getTime()) && /^\d+$/.test(raw.eventDate)) {
      parsedDate = new Date(parseInt(raw.eventDate, 10) * 1000);
    }

    if (isNaN(parsedDate.getTime())) {
      throw new ParsingError(`Invalid date format for event: ${raw.title} - Date string: ${raw.eventDate}`);
    }

    const name = raw.title.trim().replace(/\s+/g, ' '); // normalize spaces
    
    if (name.length < 3) {
      throw new ParsingError(`Event name too short: ${name}`);
    }

    if (parsedDate.getFullYear() < 1990 || parsedDate.getFullYear() > 2030) {
      throw new ParsingError(`Event date is out of reasonable bounds: ${parsedDate}`);
    }

    // Determine if upcoming by comparing the event date with the current time
    // We add a 3-hour buffer so events currently in progress are still considered upcoming
    // (24h was too long — caused yesterday's events to stay "upcoming" the next morning)
    const isUpcoming = parsedDate.getTime() > Date.now() - 3 * 60 * 60 * 1000;

    return {
      name,
      date: parsedDate,
      location: raw.venue ? raw.venue.trim().replace(/\s+/g, ' ') : null,
      isUpcoming
    };
  }
}
