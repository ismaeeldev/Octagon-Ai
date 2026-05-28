import * as cheerio from "cheerio";
import * as fs from "fs";

async function main() {
  const html = fs.readFileSync("ufc-300.html", "utf-8");
  const $ = cheerio.load(html);
  
  const fightCards = $('.c-listing-fight');
  const parsedFights = [];

  fightCards.each((_, el) => {
    const $el = $(el);
    
    const fighter1Name = $el.find('.c-listing-fight__corner-name--red').text().trim().replace(/\s+/g, ' ') || $el.find('.details-content__name--red').text().trim().replace(/\s+/g, ' ');
    const fighter2Name = $el.find('.c-listing-fight__corner-name--blue').text().trim().replace(/\s+/g, ' ') || $el.find('.details-content__name--blue').text().trim().replace(/\s+/g, ' ');
    
    if (!fighter1Name || !fighter2Name) return;

    const weightClass = $el.find('.c-listing-fight__class-text').first().text().trim() || "Catchweight";
    
    // Determine winner
    const f1Won = $el.find('.c-listing-fight__corner--red .c-listing-fight__outcome--win').length > 0;
    const f2Won = $el.find('.c-listing-fight__corner--blue .c-listing-fight__outcome--win').length > 0;
    
    let winnerName = null;
    if (f1Won) winnerName = fighter1Name;
    if (f2Won) winnerName = fighter2Name;

    // Get ending details
    let method = null;
    let endingRound = null;
    let endingTime = null;

    $el.find('.c-listing-fight__result').each((_, resEl) => {
      const label = $(resEl).find('.c-listing-fight__result-label').text().trim().toLowerCase();
      const val = $(resEl).find('.c-listing-fight__result-text').text().trim();
      if (label === 'method') method = val;
      if (label === 'round') endingRound = parseInt(val, 10) || null;
      if (label === 'time') endingTime = val;
    });

    parsedFights.push({
      fighter1Name,
      fighter2Name,
      weightClass,
      winnerName,
      method,
      endingRound,
      endingTime
    });
  });

  console.log("Parsed Fights:", parsedFights.length);
  parsedFights.forEach((f, idx) => {
    console.log(`Fight ${idx + 1}: ${f.fighter1Name} vs ${f.fighter2Name}`);
    console.log(`  Weight Class: ${f.weightClass}`);
    console.log(`  Winner: ${f.winnerName || 'None/TBD'}`);
    console.log(`  Method: ${f.method || 'N/A'} | Rd: ${f.endingRound || 'N/A'} | Time: ${f.endingTime || 'N/A'}`);
  });
}

main().catch(console.error);
