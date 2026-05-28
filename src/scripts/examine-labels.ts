import * as cheerio from "cheerio";
import * as fs from "fs";

async function main() {
  const html = fs.readFileSync("ufc-300.html", "utf-8");
  const $ = cheerio.load(html);
  
  const sample = $('.c-listing-fight').first();
  
  sample.find('.c-listing-fight__result').each((i, el) => {
    const label = $(el).find('.c-listing-fight__result-label').text().trim();
    const val = $(el).find('.c-listing-fight__result-text').text().trim();
    console.log(`Result Part ${i}: label="${label}", value="${val}"`);
  });
}

main().catch(console.error);
