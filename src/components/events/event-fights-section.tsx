"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface FightRowProps {
  fight: any;
  isUpcoming: boolean;
}

export function EventFightsSection({ eventId, isUpcoming }: { eventId: string; isUpcoming: boolean }) {
  const [fights, setFights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadFights() {
      try {
        const res = await fetch(`/api/events/${eventId}/fights`);
        if (!res.ok) throw new Error("Failed to load fights");
        const data = await res.json();
        if (active) {
          setFights(data.fights || []);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadFights();

    return () => {
      active = false;
    };
  }, [eventId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold uppercase tracking-wider mb-6 border-b border-zinc-800 pb-2 text-zinc-400">
          Syncing Fight Card & Bouts...
        </h2>
        {/* Premium Skeleton Loader */}
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="h-44 w-full bg-zinc-900/40 border border-zinc-800/60 rounded-xl animate-pulse flex flex-col justify-between p-6 overflow-hidden relative">
            <div className="flex justify-between items-center w-full">
              <div className="h-6 w-1/3 bg-zinc-800/80 rounded-md"></div>
              <div className="h-6 w-16 bg-zinc-800/80 rounded-md"></div>
              <div className="h-6 w-1/3 bg-zinc-800/80 rounded-md"></div>
            </div>
            <div className="flex justify-center items-center w-full py-4">
              <div className="h-4 w-12 bg-zinc-800/60 rounded-md"></div>
            </div>
            <div className="h-6 w-full bg-zinc-800/40 border-t border-zinc-800/40 mt-2 rounded-b-md"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-[#D22828] border border-[#D22828]/20 bg-[#D22828]/5 rounded-xl">
        <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Error Loading Fight Card</h3>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  if (fights.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/10">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">
          {isUpcoming ? "Bouts Not Finalized Yet" : "Results Not Yet Synced"}
        </h3>
        <p className="text-sm text-zinc-400">
          {isUpcoming 
            ? "The fight card for this upcoming event has not been finalized or scraped yet. Check back soon!" 
            : "The results and bouts for this past event have not been imported or scraped yet."
          }
        </p>
      </div>
    );
  }

  return (
    <section className="animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold uppercase tracking-wider mb-6 border-b border-zinc-800 pb-2 text-zinc-400">
        Fight Card & Bouts
      </h2>
      <div className="grid gap-6">
        {fights.map((fight) => (
          <FightRow key={fight.id} fight={fight} isUpcoming={isUpcoming} />
        ))}
      </div>
    </section>
  );
}

function FightRow({ fight, isUpcoming }: FightRowProps) {
  const f1IsWinner = fight.winnerId === fight.fighter1Id;
  const f2IsWinner = fight.winnerId === fight.fighter2Id;
  const hasResult = fight.winnerId !== null;

  return (
    <Card className="hover:border-primary/50 transition-all duration-300 bg-[#1e1e24]/40 backdrop-blur-md border border-zinc-800/60 overflow-hidden rounded-xl shadow-lg group">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-4 relative">
          
          {/* Fighter 1 (Left) */}
          <div className={`flex-1 text-center md:text-right w-full transition-opacity duration-300 ${!isUpcoming && hasResult && !f1IsWinner ? 'opacity-40' : 'opacity-100'}`}>
            <Link href={`/fighters/${fight.fighter1.id}`} className="inline-block hover:text-primary transition-colors">
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center md:justify-end gap-2 text-white hover:text-primary transition-colors">
                {!isUpcoming && f1IsWinner && <span className="text-emerald-500 text-lg md:text-xl">🏆</span>}
                {fight.fighter1.name}
              </h3>
              <p className="text-xs md:text-sm text-zinc-400 mt-1 font-mono">
                Record: {fight.fighter1.wins}-{fight.fighter1.losses}-{fight.fighter1.draws}
              </p>
            </Link>
          </div>

          {/* VS Divider or Result Info */}
          <div className="flex-shrink-0 px-8 py-4 md:py-0 flex flex-col items-center justify-center min-w-[120px]">
            {!isUpcoming && hasResult ? (
              <div className="text-center bg-zinc-950/40 px-3 py-1.5 rounded-lg border border-zinc-800 shadow-inner">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">Winner</span>
                <span className="text-xs font-black uppercase text-emerald-400 font-sans tracking-wide">
                  {f1IsWinner ? fight.fighter1.name.split(' ').pop() : fight.fighter2.name.split(' ').pop()}
                </span>
              </div>
            ) : (
              <>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 font-sans">VS</span>
                <div className="h-px w-20 md:h-10 md:w-px bg-zinc-800"></div>
              </>
            )}
          </div>

          {/* Fighter 2 (Right) */}
          <div className={`flex-1 text-center md:text-left w-full transition-opacity duration-300 ${!isUpcoming && hasResult && !f2IsWinner ? 'opacity-40' : 'opacity-100'}`}>
            <Link href={`/fighters/${fight.fighter2.id}`} className="inline-block hover:text-primary transition-colors">
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center md:justify-start gap-2 text-white hover:text-primary transition-colors">
                {fight.fighter2.name}
                {!isUpcoming && f2IsWinner && <span className="text-emerald-500 text-lg md:text-xl">🏆</span>}
              </h3>
              <p className="text-xs md:text-sm text-zinc-400 mt-1 font-mono">
                Record: {fight.fighter2.wins}-{fight.fighter2.losses}-{fight.fighter2.draws}
              </p>
            </Link>
          </div>

        </div>

        {/* Fight Details Footer */}
        <div className="bg-zinc-950/20 py-3 px-6 text-center border-t border-zinc-800/40 text-xs font-bold tracking-wide flex justify-center items-center gap-4 flex-wrap text-zinc-400">
          {fight.isTitleFight && (
            <Badge variant="default" className="bg-[#CA8A04]/20 text-[#CA8A04] border border-[#CA8A04]/30 font-mono text-[10px] px-2 py-0">
              🏆 Title Bout
            </Badge>
          )}
          <span className="uppercase text-[10px] tracking-widest text-zinc-300">{fight.weightClass || "Catchweight"}</span>
          
          {!isUpcoming && hasResult && (
            <>
              <span className="font-mono text-zinc-700">|</span>
              <span className="text-zinc-400">Method: <span className="text-primary uppercase font-black text-[10px] tracking-wider">{fight.method || "N/A"}</span></span>
              {fight.endingRound && (
                <>
                  <span className="font-mono text-zinc-700">|</span>
                  <span className="text-zinc-400">Round: <span className="text-white font-mono">{fight.endingRound}</span></span>
                </>
              )}
              {fight.endingTime && (
                <>
                  <span className="font-mono text-zinc-700">|</span>
                  <span className="text-zinc-400">Time: <span className="text-white font-mono">{fight.endingTime}</span></span>
                </>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
