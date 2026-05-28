import { getEvents } from "@/actions/events";
import { Container } from "@/components/layout/container";
import { EventCard } from "@/components/events/event-card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events | CageMind AI",
  description: "Browse upcoming and past MMA events, view fight cards and results.",
};

export const revalidate = 0; // Always fetch fresh database state

export default async function EventsPage() {
  const [upcomingEvents, pastEvents] = await Promise.all([
    getEvents(true),
    getEvents(false),
  ]);

  return (
    <Container className="py-20">
      <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 premium-gradient-text uppercase">Events Directory</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">Stay up to date with the latest fight cards, live odds, and AI predictions.</p>
      </div>

      <section className="mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
        <h2 className="text-3xl font-black tracking-tighter mb-8 flex items-center gap-3 uppercase">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          Upcoming Events
        </h2>
        {upcomingEvents.length === 0 ? (
          <div className="text-muted-foreground italic glass-panel p-12 rounded-2xl text-center flex flex-col items-center justify-center">
             <span className="block text-4xl mb-4 opacity-50">📅</span>
             No upcoming events scheduled right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event, i) => (
              <div key={event.id} className="animate-in fade-in zoom-in-95 duration-500 fill-mode-both" style={{ animationDelay: `${i * 100}ms` }}>
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
        <h2 className="text-3xl font-black tracking-tighter mb-8 flex items-center uppercase text-muted-foreground">
          <span className="w-1.5 h-6 bg-muted-foreground/30 mr-4 rounded-full"></span>
          Past Events
        </h2>
        {pastEvents.length === 0 ? (
          <div className="text-muted-foreground italic glass-panel p-12 rounded-2xl text-center">
            No past events found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-80 hover:opacity-100 transition-opacity duration-500">
            {pastEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
