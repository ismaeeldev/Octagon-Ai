import { getFighterById } from "@/actions/fighters";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { FighterDetailsSection } from "@/components/fighters/details-section";

// Disable default caching so the page fetches fresh database state on visit
export const revalidate = 0;

export default async function FighterDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const fighter = await getFighterById(params.id);

  if (!fighter) {
    notFound();
  }

  // Safeguard: Clean duplicate name parts for display (e.g. "Danny Abbadi Danny Abbadi" -> "Danny Abbadi")
  const nameWords = fighter.name.split(" ");
  let displayName = fighter.name;
  if (nameWords.length > 1 && nameWords.length % 2 === 0) {
    const half = nameWords.length / 2;
    const firstHalf = nameWords.slice(0, half).join(" ");
    const secondHalf = nameWords.slice(half).join(" ");
    if (firstHalf === secondHalf) {
      displayName = firstHalf;
    }
  }

  return (
    <Container className="py-12 md:py-20 animate-in fade-in duration-700">
      <div className="mb-12">
        <Button variant="ghost" asChild className="mb-8 -ml-4 text-muted-foreground hover:text-primary transition-all hover:-translate-x-1 font-bold uppercase tracking-widest text-xs">
          <Link href="/fighters">← Back to Fighters</Link>
        </Button>
        <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-end justify-between animate-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end w-full lg:w-auto">
            {/* Fighter Image cutout */}
            <div className="relative w-48 h-48 md:w-56 md:h-56 bg-zinc-950/40 rounded-full flex items-end justify-center overflow-hidden border border-zinc-800/80 shadow-[0_0_50px_-10px_rgba(210,40,40,0.2)] flex-shrink-0">
              {/* Internal neon ring */}
              <div className="absolute inset-2 border border-primary/10 rounded-full"></div>
              {/* Back glow */}
              <div className="absolute bottom-0 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
              
              {fighter.imageUrl && fighter.imageUrl !== "null" && fighter.imageUrl !== "undefined" ? (
                <img
                  src={fighter.imageUrl}
                  alt={displayName}
                  className="h-[95%] object-contain select-none z-10 filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.6)]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 pb-4 z-10">
                  <span className="text-7xl font-black uppercase font-sans">
                    {displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 drop-shadow-sm leading-none">{displayName}</h1>
              <div className="flex gap-4 items-center justify-center md:justify-start">
                <Badge variant="outline" className="text-sm border-white/20 bg-black/20 backdrop-blur-md px-4 py-1.5 font-bold uppercase tracking-widest shadow-sm">
                  {fighter.weightClass || "Unranked"}
                </Badge>
                <Badge variant="default" className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 shadow-[0_0_15px_-3px_rgba(210,40,40,0.4)] text-sm px-4 py-1.5 font-mono">
                  Elo: {fighter.eloRating}
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-center md:text-right bg-muted/10 p-6 rounded-2xl border border-border/30 backdrop-blur-sm shadow-xl min-w-[220px] w-full lg:w-auto font-sans">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Pro Record</p>
            <p className="text-5xl font-black font-mono tracking-tighter">
              {fighter.wins}<span className="text-muted-foreground opacity-50 mx-1">-</span>{fighter.losses}<span className="text-muted-foreground opacity-50 mx-1">-</span>{fighter.draws}
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Statistics Component with loading skeleton */}
      <FighterDetailsSection
        id={fighter.id}
        name={fighter.name}
        initialWins={fighter.wins}
        initialLosses={fighter.losses}
        initialDraws={fighter.draws}
      />
    </Container>
  );
}
