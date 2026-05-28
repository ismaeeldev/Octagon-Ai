import * as cheerio from "cheerio";
import * as fs from "fs";

async function main() {
  const html = fs.readFileSync("ufc-300.html", "utf-8");
  const $ = cheerio.load(html);
  
  // Find completed fights
  const fightCards = $('.c-listing-fight');
  console.log("Number of c-listing-fight elements:", fightCards.length);
  
  fightCards.slice(0, 3).each((i, el) => {
    const $el = $(el);
    console.log(`\n--- Fight ${i+1} ---`);
    console.log("Fighter 1 (Red Corner Class):", $el.find('.c-listing-fight__corner-name--red, .c-listing-fight__corner--red').text().trim().replace(/\s+/g, ' '));
    console.log("Fighter 2 (Blue Corner Class):", $el.find('.c-listing-fight__corner-name--blue, .c-listing-fight__corner--blue').text().trim().replace(/\s+/g, ' '));
    
    // Check outcome / winner indicators
    const redOutcome = $el.find('.c-listing-fight__corner-body--red .c-listing-fight__outcome, .c-listing-fight__outcome--red').text().trim();
    const blueOutcome = $el.find('.c-listing-fight__corner-body--blue .c-listing-fight__outcome, .c-listing-fight__outcome--blue').text().trim();
    console.log("Red Corner Outcome:", redOutcome);
    console.log("Blue Corner Outcome:", blueOutcome);
    
    // Let's print outcome html
    console.log("Outcome elements text:", $el.find('.c-listing-fight__outcome').map((_, e) => $(e).text().trim()).get());
    
    // Let's print the method, round, time
    const method = $el.find('.c-listing-fight__result-text').first().text().trim();
    console.log("Result / Method text:", method);
    
    // Let's dump all text inside result elements
    console.log("Detail elements text:", $el.find('.c-listing-fight__results, .c-listing-fight__result, .c-listing-fight__details').text().trim().replace(/\s+/g, ' '));
  });
}

main().catch(console.error);
