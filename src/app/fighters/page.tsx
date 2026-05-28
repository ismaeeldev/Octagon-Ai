import { Suspense } from "react";
import { getFighters } from "@/actions/fighters";
import { Container } from "@/components/layout/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Search } from "@/components/fighters/search";
import { Pagination } from "@/components/fighters/pagination";

function FighterListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="h-full bg-card/20 backdrop-blur-sm border-border/50 animate-pulse relative overflow-hidden">
          <CardHeader className="pb-4 relative z-10 border-b border-border/30 bg-muted/10 h-[68px]">
            <div className="w-2/3 h-6 bg-muted rounded-md" />
          </CardHeader>
          <CardContent className="pt-4 relative z-10">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="w-12 h-4 bg-muted rounded-md" />
                <div className="w-16 h-4 bg-muted rounded-md" />
              </div>
              <div className="flex justify-between items-center">
                <div className="w-14 h-4 bg-muted rounded-md" />
                <div className="w-12 h-4 bg-muted rounded-md" />
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/30">
                <div className="w-8 h-4 bg-muted rounded-md" />
                <div className="w-10 h-6 bg-muted rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function FighterList({ query, page }: { query: string; page: number }) {
  const { fighters, totalPages } = await getFighters({ query, page, limit: 20 });

  if (fighters.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground italic glass-panel rounded-2xl">
        No fighters found matching "{query}".
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
        {fighters.map((fighter, i) => {
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
            <Link key={fighter.id} href={`/fighters/${fighter.id}`} className="group block" style={{ animationDelay: `${i * 50}ms` }}>
              <Card className="h-full bg-[#1e1e24]/40 backdrop-blur-md border border-zinc-800/60 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(210,40,40,0.25)] hover:-translate-y-1 hover:border-primary/40 relative overflow-hidden group-hover:scale-[1.02] flex flex-col rounded-xl">
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-md pointer-events-none"></div>
                
                {/* Fighter Image Header */}
                <div className="relative w-full h-44 bg-transparent flex items-end justify-center overflow-hidden pt-4">
                  {/* Back glow pedestal */}
                  <div className="absolute bottom-0 w-24 h-24 bg-primary/10 rounded-full blur-xl transition-all duration-500 group-hover:bg-primary/20 group-hover:scale-125"></div>
                  <div className="absolute bottom-0 w-32 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full shadow-[0_0_15px_rgba(210,40,40,0.4)]"></div>

                  {fighter.imageUrl && fighter.imageUrl !== "null" && fighter.imageUrl !== "undefined" ? (
                    <img
                      src={fighter.imageUrl}
                      alt={displayName}
                      className="h-[95%] object-contain transition-transform duration-500 group-hover:scale-108 group-hover:-translate-y-1 select-none z-10 filter drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/20 group-hover:text-primary/10 transition-colors duration-300 pb-2 z-10">
                      <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-b from-zinc-800/10 to-zinc-900/30 rounded-full border border-zinc-850 shadow-[inset_0_0_12px_rgba(0,0,0,0.5)]">
                        <div className="absolute inset-0 bg-primary/5 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="text-xl font-black tracking-tighter uppercase text-zinc-500 group-hover:text-primary transition-colors duration-300 font-sans z-10 select-none">
                          {displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Badge Overlay */}
                  <div className="absolute top-3 right-3 z-20">
                    <Badge variant="outline" className="text-[10px] font-mono tracking-widest uppercase bg-zinc-950/80 text-zinc-400 border-zinc-800 backdrop-blur-md px-2 py-0.5 shadow-sm">
                      {fighter.weightClass ? fighter.weightClass.replace('weight', '') : 'UFC'}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2 pt-3 relative z-10 bg-transparent flex-grow px-5">
                  <CardTitle className="text-base font-black tracking-tight group-hover:text-primary transition-colors duration-300 uppercase leading-none min-h-[36px] flex items-center text-white">
                    {displayName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 pb-5 relative z-10 mt-auto px-5">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 uppercase tracking-wider font-bold">Class</span>
                      <span className="font-semibold text-zinc-300 text-xs">{fighter.weightClass || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 uppercase tracking-wider font-bold">Record</span>
                      <span className="font-mono font-bold text-zinc-200">
                        {fighter.wins}-{fighter.losses}-{fighter.draws}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-zinc-800/80">
                      <span className="text-xs uppercase tracking-wider font-bold text-zinc-500">Elo Rating</span>
                      <Badge variant="default" className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 shadow-[0_0_10px_-2px_rgba(210,40,40,0.2)] font-mono text-xs px-2.5 py-0.5">
                        {fighter.eloRating}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      {totalPages > 1 && <Pagination totalPages={totalPages} currentPage={page} />}
    </>
  );
}

export default async function FightersPage(props: {
  searchParams?: Promise<{
    q?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || "";
  const page = Number(searchParams?.page) || 1;

  return (
    <Container className="py-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 premium-gradient-text uppercase">Fighter Directory</h1>
          <p className="text-lg text-muted-foreground">Browse all fighters, analyze physical attributes, and track Elo ratings.</p>
        </div>
        <Search />
      </div>

      <Suspense key={query + page} fallback={<FighterListSkeleton />}>
        <FighterList query={query} page={page} />
      </Suspense>
    </Container>
  );
}
