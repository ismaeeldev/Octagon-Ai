import * as cheerio from "cheerio";
import * as fs from "fs";

async function main() {
  const html = fs.readFileSync("ufc-300.html", "utf-8");
  const $ = cheerio.load(html);
  
  const sample = $('.c-listing-fight').first();
  
  // Let's print out all divs/spans inside c-listing-fight that contain result details
  console.log("Details HTML:\n", sample.find('.c-listing-fight__results, .c-listing-fight__result, .c-listing-fight__details-wrap').html()?.trim());
}

main().catch(console.error);
