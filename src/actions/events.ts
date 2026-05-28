"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma";

export async function getEvents(isUpcoming?: boolean) {
  const where: Prisma.EventWhereInput = {};
  if (isUpcoming !== undefined) {
    where.isUpcoming = isUpcoming;
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: {
      date: isUpcoming ? "asc" : "desc",
    },
    include: {
      fights: {
        include: {
          fighter1: true,
          fighter2: true,
        },
        orderBy: {
          isTitleFight: "desc",
        },
        take: 1,
      },
    },
  });

  return events;
}

export async function getEventById(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      fights: {
        include: {
          fighter1: true,
          fighter2: true,
        },
      },
    },
  });

  return event;
}
