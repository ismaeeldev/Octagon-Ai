import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { EventFightsSection } from "@/components/events/event-fights-section";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0; // Disable caching so live scraper results display immediately on sync

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id }
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 mt-16 max-w-5xl mx-auto">
      
      {/* Event Header */}
      <div className="mb-12 text-center md:text-left">
        <Badge variant={event.isUpcoming ? "default" : "secondary"} className="mb-4">
          {event.isUpcoming ? "Upcoming Event" : "Past Event"}
        </Badge>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4 premium-gradient-text text-white">
          {event.name}
        </h1>
        <div className="flex flex-col md:flex-row items-center md:justify-start gap-4 text-muted-foreground text-lg">
          <span className="flex items-center gap-2">
            📅 {format(new Date(event.date), "MMMM do, yyyy")}
          </span>
          <span className="hidden md:inline text-zinc-700">•</span>
          <span className="flex items-center gap-2">
            📍 {event.location || "TBD"}
          </span>
        </div>
      </div>

      {/* Fight Card list */}
      <div className="space-y-16">
        <EventFightsSection eventId={event.id} isUpcoming={event.isUpcoming} />
      </div>
    </div>
  );
}
