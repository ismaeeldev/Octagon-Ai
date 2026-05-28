import { prisma } from "@/lib/db";
import * as cheerio from "cheerio";

/**
 * Scrapes detailed fighter info (age, height, reach, stats, image) from UFC.com
 * and updates the database. Returns the updated fighter data.
 */
export async function scrapeAndSaveFighter(id: string) {
  const fighter = await prisma.fighter.findUnique({
    where: { id },
  });

  if (!fighter) {
    throw new Error("Fighter not found");
  }

  // If fighter already has a valid image, return immediately (DB fallback)
  const existingImg = fighter.imageUrl?.trim();
  if (existingImg && existingImg !== "null" && existingImg !== "undefined") {
    return {
      id: fighter.id,
      name: fighter.name,
      weightClass: fighter.weightClass,
      imageUrl: fighter.imageUrl,
      eloRating: fighter.eloRating,
      wins: fighter.wins,
      losses: fighter.losses,
      draws: fighter.draws,
      age: fighter.age,
      height: fighter.height,
      reach: fighter.reach,
      koWins: fighter.koWins,
      subWins: fighter.subWins,
    };
  }

  // Clean name to construct slug for UFC athlete page
  const words = fighter.name.split(" ");
  let cleanedName = fighter.name;
  if (words.length > 1 && words.length % 2 === 0) {
    const half = words.length / 2;
    const firstHalf = words.slice(0, half).join(" ");
    const secondHalf = words.slice(half).join(" ");
    if (firstHalf === secondHalf) {
      cleanedName = firstHalf;
    }
  }

  const slug = cleanedName.toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-");

  const url = `https://www.ufc.com/athlete/${slug}`;
  
  let age = fighter.age;
  let height = fighter.height;
  let reach = fighter.reach;
  let koWins = fighter.koWins;
  let subWins = fighter.subWins;
  let imageUrl = fighter.imageUrl;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000), // 10s timeout to keep page loads fast
    });

    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html);

      // Parse physical bio info
      $(".c-bio__label").each((_, el) => {
        const label = $(el).text().trim().toLowerCase();
        const valueText = $(el).next().text().trim();
        
        if (valueText) {
          if (label === "age") {
            const num = parseInt(valueText, 10);
            if (!isNaN(num)) age = num;
          } else if (label === "height") {
            const num = parseFloat(valueText);
            if (!isNaN(num)) height = num;
          } else if (label === "reach") {
            const num = parseFloat(valueText);
            if (!isNaN(num)) reach = num;
          }
        }
      });

      // Parse stats (Method of Victory wins)
      $(".hero-profile__stat").each((_, el) => {
        const statText = $(el).find(".hero-profile__stat-text").text().trim().toLowerCase();
        const statNumbText = $(el).find(".hero-profile__stat-numb").text().trim();
        
        if (statNumbText) {
          const num = parseInt(statNumbText, 10);
          if (!isNaN(num)) {
            if (statText.includes("knockout")) {
              koWins = num;
            } else if (statText.includes("submission")) {
              subWins = num;
            }
          }
        }
      });

      // Parse premium cutout image
      const heroImgUrl = $(".hero-profile__image").attr("src");
      if (heroImgUrl) {
        imageUrl = heroImgUrl;
      }

      // Update database with freshly scraped attributes
      await prisma.fighter.update({
        where: { id: fighter.id },
        data: { age, height, reach, koWins, subWins, imageUrl },
      });
    }
  } catch (scrapeError) {
    console.error(`Failed to scrape live profile for ${fighter.name}:`, scrapeError);
  }

  return {
    id: fighter.id,
    name: fighter.name,
    weightClass: fighter.weightClass,
    imageUrl,
    eloRating: fighter.eloRating,
    wins: fighter.wins,
    losses: fighter.losses,
    draws: fighter.draws,
    age,
    height,
    reach,
    koWins,
    subWins,
  };
}
