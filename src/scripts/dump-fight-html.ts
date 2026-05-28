import * as cheerio from "cheerio";
import * as fs from "fs";

async function main() {
  const html = fs.readFileSync("ufc-300.html", "utf-8");
  const $ = cheerio.load(html);
  
  const sample = $('.c-listing-fight').first();
  console.log("Entire c-listing-fight HTML:\n", sample.html());
}

main().catch(console.error);
