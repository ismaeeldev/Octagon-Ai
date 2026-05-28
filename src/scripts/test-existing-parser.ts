import { UfcFightParser } from "../scrapers/parsers/ufc-fight-parser";
import * as fs from "fs";

async function main() {
  const html = fs.readFileSync("ufc-300.html", "utf-8");
  const parser = new UfcFightParser();
  const fights = parser.parse(html, "test-event-id");
  
  console.log("Parsed fights count:", fights.length);
  fights.slice(0, 5).forEach((f, i) => {
    console.log(`Fight ${i+1}: "${f.fighter1Name}" vs "${f.fighter2Name}" | Weight: ${f.weightClass}`);
  });
}

main().catch(console.error);
