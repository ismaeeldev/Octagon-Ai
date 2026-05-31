"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useEffect, useState } from "react";

function hasValidImage(url: string | null | undefined): url is string {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined" || trimmed === "N/A") return false;
  return true;
}

interface FighterData {
  id: string;
  name: string;
  imageUrl: string | null;
}

interface FightData {
  fighter1: FighterData;
  fighter2: FighterData;
  isTitleFight: boolean;
  weightClass: string | null;
}

export function EventCard({ event }: { event: any }) {
  // Use server data as initial state (may already have fights from getEvents)
  const serverFight = event.fights?.[0];
  const [mainFight, setMainFight] = useState<FightData | null>(
    serverFight ? {
      fighter1: serverFight.fighter1,
      fighter2: serverFight.fighter2,
      isTitleFight: serverFight.isTitleFight,
      weightClass: serverFight.weightClass,
    } : null
  );
  const [loading, setLoading] = useState(!serverFight);

  // Lazy-load fight data and trigger on-demand scraping
  useEffect(() => {
    // If we already have fight data with valid images, skip
    const f1HasImg = hasValidImage(serverFight?.fighter1?.imageUrl);
    const f2HasImg = hasValidImage(serverFight?.fighter2?.imageUrl);
    if (serverFight && f1HasImg && f2HasImg) return;

    let cancelled = false;

    const fetchFights = async () => {
      try {
        const res = await fetch(`/api/events/${event.id}/fights`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        if (data.fights?.length > 0) {
          const fight = data.fights[0];
          setMainFight({
            fighter1: fight.fighter1,
            fighter2: fight.fighter2,
            isTitleFight: fight.isTitleFight,
            weightClass: fight.weightClass,
          });
        }
      } catch (err) {
        // Silently fail — card just shows TBD/initials
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Stagger requests to avoid overwhelming server
    const delay = Math.random() * 2000;
    const timer = setTimeout(fetchFights, delay);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [event.id, serverFight]);

  const f1 = mainFight?.fighter1;
  const f2 = mainFight?.fighter2;
  const f1Img = hasValidImage(f1?.imageUrl) ? f1!.imageUrl : null;
  const f2Img = hasValidImage(f2?.imageUrl) ? f2!.imageUrl : null;

  return (
    <Link href={`/events/${event.id}`} className="group block h-full">
      <Card className="h-[360px] flex flex-col justify-between bg-[#131316]/60 backdrop-blur-md border border-zinc-800/60 transition-all duration-500 hover:shadow-[0_0_30px_-5px_rgba(210,40,40,0.2)] hover:-translate-y-1.5 hover:border-primary/30 relative overflow-hidden rounded-2xl">
        
        {/* Header / Event Name */}
        <div className="p-5 pb-2 relative z-20 flex justify-between items-start gap-4">
          <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors duration-300 line-clamp-2 max-w-[70%] text-white leading-tight">
            {event.name}
          </h3>
          {event.isUpcoming ? (
            <Badge variant="default" className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 shadow-[0_0_10px_-2px_rgba(210,40,40,0.3)] text-[10px] uppercase font-bold tracking-widest px-2 py-0.5">
              Upcoming
            </Badge>
          ) : (
            <Badge variant="outline" className="border-border/50 text-zinc-400 bg-black/40 backdrop-blur-md text-[10px] uppercase font-bold tracking-widest px-2 py-0.5">
              Past
            </Badge>
          )}
        </div>

        {/* Center: Face-off graphic */}
        <div className="relative flex-1 flex items-center justify-between px-6 overflow-hidden h-[180px] bg-gradient-to-b from-transparent via-zinc-900/10 to-zinc-950/20">
          
          {/* Background split gradient: Red on left, Blue on right */}
          <div className="absolute inset-0 flex pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity duration-500">
            <div className="flex-1 bg-gradient-to-tr from-[#D22828]/20 to-transparent blur-xl"></div>
            <div className="flex-1 bg-gradient-to-tl from-blue-500/20 to-transparent blur-xl"></div>
          </div>

          {loading ? (
            /* Loading skeleton */
            <div className="w-full flex items-center justify-between relative z-10">
              <div className="w-[42%] flex flex-col items-center gap-2">
                <div className="h-[120px] w-[100px] bg-zinc-800/50 rounded-lg animate-pulse"></div>
                <div className="h-3 w-20 bg-zinc-800/50 rounded animate-pulse"></div>
              </div>
              <div className="w-8 h-8 rounded-full bg-zinc-800/50 animate-pulse"></div>
              <div className="w-[42%] flex flex-col items-center gap-2">
                <div className="h-[120px] w-[100px] bg-zinc-800/50 rounded-lg animate-pulse"></div>
                <div className="h-3 w-20 bg-zinc-800/50 rounded animate-pulse"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Left Fighter */}
              <div className="w-[42%] flex flex-col items-center justify-end h-full relative z-10 transition-transform duration-500 group-hover:-translate-x-1">
                <img
                  src={f1Img || "/fallback_image.png"}
                  alt={f1?.name || "Fighter 1"}
                  referrerPolicy="no-referrer"
                  className="h-[150px] object-contain select-none filter drop-shadow-[0_5px_10px_rgba(0,0,0,0.6)] transition-opacity duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/fallback_image.png'; }}
                />
                <span className="absolute bottom-1 bg-zinc-950/80 border border-zinc-800/80 px-2 py-0.5 rounded text-[10px] font-black uppercase text-zinc-300 tracking-wider max-w-full truncate shadow-md">
                  {f1 ? f1.name.split(' ').pop() : "TBD"}
                </span>
              </div>

              {/* VS Centerpiece */}
              <div className="flex flex-col items-center justify-center relative z-20">
                <span className="text-xs font-black text-zinc-500 italic bg-zinc-950 border border-zinc-800 w-8 h-8 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-primary/50 group-hover:text-primary transition-all duration-300">
                  VS
                </span>
              </div>

              {/* Right Fighter */}
              <div className="w-[42%] flex flex-col items-center justify-end h-full relative z-10 transition-transform duration-500 group-hover:translate-x-1">
                <img
                  src={f2Img || "/fallback_image.png"}
                  alt={f2?.name || "Fighter 2"}
                  referrerPolicy="no-referrer"
                  className="h-[150px] object-contain select-none filter drop-shadow-[0_5px_10px_rgba(0,0,0,0.6)] transition-opacity duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/fallback_image.png'; }}
                />
                <span className="absolute bottom-1 bg-zinc-950/80 border border-zinc-800/80 px-2 py-0.5 rounded text-[10px] font-black uppercase text-zinc-300 tracking-wider max-w-full truncate shadow-md">
                  {f2 ? f2.name.split(' ').pop() : "TBD"}
                </span>
              </div>
            </>
          )}

        </div>

        {/* Footer: Date & Location */}
        <div className="p-5 pt-3 border-t border-zinc-800/40 relative z-10 flex flex-col gap-2 bg-[#17171c]/40">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-bold uppercase tracking-wider">Date</span>
            <span className="font-semibold text-zinc-300 font-mono">
              {new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(event.date))}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-bold uppercase tracking-wider">Location</span>
            <span className="font-semibold text-zinc-300 truncate max-w-[70%]">{event.location || "TBD"}</span>
          </div>
        </div>

      </Card>
    </Link>
  );
}
