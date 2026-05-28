import { NextResponse } from "next/server";
import { scrapeAndSaveFighter } from "@/lib/fighter-scraper";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const result = await scrapeAndSaveFighter(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
