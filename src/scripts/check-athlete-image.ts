import { UfcSourceAdapter } from "../scrapers/adapters/ufc-source-adapter";
import * as cheerio from "cheerio";

async function main() {
  const adapter = new UfcSourceAdapter();
  const html = await adapter.fetchHtml("https://www.ufc.com/athlete/alex-pereira");
  const $ = cheerio.load(html);
  
  // Find all img elements
  $("img").each((i, el) => {
    const src = $(el).attr("src");
    const alt = $(el).attr("alt");
    const cls = $(el).attr("class");
    if (src && (src.includes("profile") || src.includes("PEREIRA") || src.includes("athlete"))) {
      console.log(`Image ${i}: class="${cls}", alt="${alt}", src="${src}"`);
    }
  });
}

main().catch(console.error);
