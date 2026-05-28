import { UfcSourceAdapter } from "../scrapers/adapters/ufc-source-adapter";
import * as cheerio from "cheerio";
import * as fs from "fs";

async function main() {
  const adapter = new UfcSourceAdapter();
  // Fetch completed UFC 300 page
  const html = await adapter.fetchHtml("https://www.ufc.com/event/ufc-300");
  fs.writeFileSync("ufc-300.html", html);
  
  const $ = cheerio.load(html);
  
  // Let's find fight elements
  const fightCards = $('.c-listing-fight, .fight-card, li.l-listing__item, .c-listing-fight__content');
  console.log("Found fight elements count:", fightCards.length);
  
  const sample = fightCards.first();
  console.log("Sample HTML excerpt:\n", sample.html()?.slice(0, 1000));
}

main().catch(console.error);
