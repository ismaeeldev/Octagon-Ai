"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma";

export async function getFighters({
  query = "",
  page = 1,
  limit = 8,
}: {
  query?: string;
  page?: number;
  limit?: number;
}) {
  if (!query) {
    const [withImages, withoutImages] = await Promise.all([
      prisma.fighter.findMany({
        where: {
          isActive: true,
          imageUrl: { not: null, notIn: ["null", "undefined", ""] }
        },
        orderBy: { eloRating: "desc" }
      }),
      prisma.fighter.findMany({
        where: {
          isActive: true,
          OR: [
            { imageUrl: null },
            { imageUrl: { in: ["null", "undefined", ""] } }
          ]
        },
        orderBy: { eloRating: "desc" }
      })
    ]);

    const women = withImages.filter(f => f.weightClass?.toLowerCase().includes("women"));
    const men = withImages.filter(f => !f.weightClass?.toLowerCase().includes("women"));

    const shuffle = (array: any[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    shuffle(women);
    shuffle(men);

    const shuffledImages = [...men, ...women];
    shuffle(shuffledImages);

    const allCombined = [...shuffledImages, ...withoutImages];
    const totalCount = allCombined.length;
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;
    const paginatedFighters = allCombined.slice(skip, skip + limit);

    return {
      fighters: paginatedFighters,
      totalPages,
      currentPage: page,
    };
  }

  const skip = (page - 1) * limit;

  const where: Prisma.FighterWhereInput = {
    name: {
      contains: query,
      mode: "insensitive",
    },
  };

  const [fighters, totalCount] = await Promise.all([
    prisma.fighter.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        eloRating: "desc",
      },
    }),
    prisma.fighter.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    fighters,
    totalPages,
    currentPage: page,
  };
}

export async function getFighterById(id: string) {
  const fighter = await prisma.fighter.findUnique({
    where: { id },
  });

  return fighter;
}
