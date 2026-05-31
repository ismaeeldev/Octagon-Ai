"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Lock, Activity, TrendingUp, Sparkles, AlertTriangle, Swords, ChevronDown, ChevronUp, User, Ruler } from "lucide-react";

interface FightRowProps {
  fight: any;
  isUpcoming: boolean;
  isPremium: boolean;
}

export function EventFightsSection({ eventId, isUpcoming }: { eventId: string; isUpcoming: boolean }) {
  const [fights, setFights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();
  const isPremium = session?.user?.isPremium === true;

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
          <FightRow key={fight.id} fight={fight} isUpcoming={isUpcoming} isPremium={isPremium} />
        ))}
      </div>
    </section>
  );
}

function FightRow({ fight, isUpcoming, isPremium }: FightRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"edge" | "elo" | "performance">("edge");

  const f1IsWinner = fight.winnerId === fight.fighter1Id;
  const f2IsWinner = fight.winnerId === fight.fighter2Id;
  const hasResult = fight.winnerId !== null;

  // Implied probability calculation helper
  const getImpliedProbability = (odds: number | null): number => {
    if (!odds) return 50;
    if (odds > 0) {
      return (100 / (odds + 100)) * 100;
    } else {
      return (Math.abs(odds) / (Math.abs(odds) + 100)) * 100;
    }
  };

  const impliedProb1 = getImpliedProbability(fight.oddsFighter1);
  const impliedProb2 = getImpliedProbability(fight.oddsFighter2);

  // Parse win probabilities from AI summary or estimate via Elo Diff
  const extractProbabilities = (summary: string | null, f1Name: string): { f1Prob: number, f2Prob: number } => {
    if (summary) {
      const match = summary.match(/(\d+\.\d+)%/);
      if (match) {
        const prob = parseFloat(match[1]);
        if (summary.includes(`${f1Name} is favored`)) {
          return { f1Prob: prob, f2Prob: 100 - prob };
        } else {
          return { f1Prob: 100 - prob, f2Prob: prob };
        }
      }
    }
    // ELO based fallback probability if summary doesn't exist
    const eloDiff = (fight.fighter1?.eloRating || 1500) - (fight.fighter2?.eloRating || 1500);
    const probF1 = 1 / (1 + Math.exp(-eloDiff / 250));
    return { f1Prob: probF1 * 100, f2Prob: (1 - probF1) * 100 };
  };

  const aiProbs = extractProbabilities(fight.aiPrediction, fight.fighter1.name);

  // Calculate Betting Value Edge
  const edgeF1 = aiProbs.f1Prob - impliedProb1;
  const edgeF2 = aiProbs.f2Prob - impliedProb2;
  const bestEdge = edgeF1 > edgeF2 ? { fighter: fight.fighter1.name, val: edgeF1 } : { fighter: fight.fighter2.name, val: edgeF2 };

  return (
    <Card className="hover:border-primary/40 transition-all duration-300 bg-[#1e1e24]/40 backdrop-blur-md border border-zinc-800/60 overflow-hidden rounded-xl shadow-lg group">
      <CardContent className="p-0">
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex flex-col md:flex-row items-center justify-between p-6 gap-4 relative cursor-pointer hover:bg-white/[0.01] transition-all"
        >
          {/* Fighter 1 (Left) */}
          <div className={`flex-1 text-center md:text-right w-full transition-opacity duration-300 ${!isUpcoming && hasResult && !f1IsWinner ? 'opacity-40' : 'opacity-100'}`}>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center md:justify-end gap-2 text-white group-hover:text-primary transition-colors">
              {!isUpcoming && f1IsWinner && <span className="text-emerald-500 text-lg md:text-xl">🏆</span>}
              {fight.fighter1.name}
            </h3>
            <p className="text-xs md:text-sm text-zinc-400 mt-1 font-mono">
              Record: {fight.fighter1.wins}-{fight.fighter1.losses}-{fight.fighter1.draws} | Elo: {fight.fighter1.eloRating}
            </p>
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
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 font-sans">VS</span>
                {isUpcoming && (
                  <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-zinc-800 bg-zinc-950 text-zinc-400 px-2 py-0.5 rounded mt-1 flex items-center gap-1 font-mono">
                    {fight.oddsFighter1 ? `${fight.oddsFighter1 > 0 ? '+' : ''}${fight.oddsFighter1}` : 'Odds'} / {fight.oddsFighter2 ? `${fight.oddsFighter2 > 0 ? '+' : ''}${fight.oddsFighter2}` : 'Odds'}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Fighter 2 (Right) */}
          <div className={`flex-1 text-center md:text-left w-full transition-opacity duration-300 ${!isUpcoming && hasResult && !f2IsWinner ? 'opacity-40' : 'opacity-100'}`}>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center md:justify-start gap-2 text-white group-hover:text-primary transition-colors">
              {fight.fighter2.name}
              {!isUpcoming && f2IsWinner && <span className="text-emerald-500 text-lg md:text-xl">🏆</span>}
            </h3>
            <p className="text-xs md:text-sm text-zinc-400 mt-1 font-mono">
              Record: {fight.fighter2.wins}-{fight.fighter2.losses}-{fight.fighter2.draws} | Elo: {fight.fighter2.eloRating}
            </p>
          </div>

          {/* Accordion toggle indicator */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block text-zinc-500 group-hover:text-zinc-300">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        {/* Expandable Premium details section */}
        {isExpanded && (
          <div className="border-t border-zinc-800 bg-zinc-950/40 backdrop-blur-sm p-6 animate-in slide-in-from-top-2 duration-300">
            {!isPremium ? (
              // LOCKED PREMIUM VIEW
              <div className="relative h-64 rounded-xl overflow-hidden bg-zinc-950/70 border border-zinc-850 flex flex-col items-center justify-center p-8 text-center group/lock">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-40"></div>
                <div className="absolute inset-0 flex flex-col justify-center gap-4 px-12 blur-md opacity-25 select-none pointer-events-none">
                  <div className="h-6 w-full bg-zinc-800 rounded"></div>
                  <div className="h-4 w-3/4 bg-zinc-850 rounded"></div>
                  <div className="h-4 w-1/2 bg-zinc-850 rounded"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mb-4 text-primary animate-pulse">
                    <Lock className="w-6 h-6 shadow-[0_0_15px_rgba(210,40,40,0.4)]" />
                  </div>
                  <h4 className="text-white font-black uppercase tracking-wider text-lg mb-2">Premium Analytics Locked</h4>
                  <p className="text-zinc-400 text-sm max-w-md mb-6 leading-relaxed">
                    Subscribe to premium to unlock the **AI Betting Edge Finder**, dynamic **Elo rating curves**, and **detailed physical matchup attributes** for this event.
                  </p>
                  <Link href="/pricing" className="bg-primary hover:bg-red-700 text-white font-black uppercase tracking-wider text-xs px-8 py-3 rounded-xl transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95">
                    Unlock Premium Now
                  </Link>
                </div>
              </div>
            ) : (
              // UNLOCKED PREMIUM TABS
              <div className="space-y-6">
                {/* Tab selector */}
                <div className="flex border-b border-zinc-850 gap-6 text-sm font-bold uppercase tracking-wider mb-6">
                  <button 
                    onClick={() => setActiveTab("edge")}
                    className={`pb-3 px-1 border-b-2 transition-all ${activeTab === "edge" ? "border-primary text-primary" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
                  >
                    Betting Edge Finder
                  </button>
                  <button 
                    onClick={() => setActiveTab("elo")}
                    className={`pb-3 px-1 border-b-2 transition-all ${activeTab === "elo" ? "border-primary text-primary" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
                  >
                    Elo Rankings
                  </button>
                  <button 
                    onClick={() => setActiveTab("performance")}
                    className={`pb-3 px-1 border-b-2 transition-all ${activeTab === "performance" ? "border-primary text-primary" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
                  >
                    Performance Stats
                  </button>
                </div>

                {/* Tab 1: Edge Finder */}
                {activeTab === "edge" && (
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-5">
                      <div className="bg-zinc-950/80 p-5 rounded-xl border border-zinc-850 space-y-4">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500">
                          <span>Fighter Win Probabilities</span>
                          <span>AI Prediction</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-zinc-200">{fight.fighter1.name}</span>
                            <span className="text-blue-400 font-black font-mono text-base">{aiProbs.f1Prob.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-zinc-200">{fight.fighter2.name}</span>
                            <span className="text-orange-400 font-black font-mono text-base">{aiProbs.f2Prob.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-zinc-900 rounded-full flex overflow-hidden border border-zinc-850">
                            <div className="h-full bg-blue-500" style={{ width: `${aiProbs.f1Prob}%` }}></div>
                            <div className="h-full bg-orange-500" style={{ width: `${aiProbs.f2Prob}%` }}></div>
                          </div>
                        </div>
                      </div>

                      {bestEdge.val > 0 ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <h5 className="text-emerald-400 font-black uppercase text-xs tracking-wider mb-1">Value Betting Edge Detected</h5>
                            <p className="text-zinc-300 text-sm leading-relaxed">
                              AI predicts higher success than market odds. Value edge of **+{bestEdge.val.toFixed(1)}%** on **{bestEdge.fighter}**.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                          <div>
                            <h5 className="text-zinc-400 font-black uppercase text-xs tracking-wider mb-1">No Betting Edge Detected</h5>
                            <p className="text-zinc-500 text-sm">
                              The bookmaker implied odds closely align with AI predictive metrics. Caution advised.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-zinc-950/80 p-6 rounded-xl border border-zinc-850 flex items-start gap-4 h-full justify-center flex-col">
                      <div className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-primary" /> AI Match Narrative
                      </div>
                      <p className="text-zinc-200 leading-relaxed text-sm">
                        {fight.aiPrediction || `This bout features a rating delta of ${Math.abs((fight.fighter1?.eloRating || 1500) - (fight.fighter2?.eloRating || 1500))} Elo points. Physical and performance profiles predict a competitive match.`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Elo Comparison */}
                {activeTab === "elo" && (
                  <div className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-850 space-y-6">
                    <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 text-center">
                      <div>
                        <h5 className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-1">{fight.fighter1.name}</h5>
                        <p className="text-4xl font-black text-white font-mono">{fight.fighter1.eloRating}</p>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-500 font-sans uppercase">Elo Rating</div>
                      <div>
                        <h5 className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-1">{fight.fighter2.name}</h5>
                        <p className="text-4xl font-black text-white font-mono">{fight.fighter2.eloRating}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full h-3 bg-zinc-900 rounded-full flex overflow-hidden border border-zinc-850">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-1000" 
                          style={{ width: `${(fight.fighter1.eloRating / (fight.fighter1.eloRating + fight.fighter2.eloRating)) * 100}%` }}
                        ></div>
                        <div 
                          className="h-full bg-orange-500 transition-all duration-1000" 
                          style={{ width: `${(fight.fighter2.eloRating / (fight.fighter1.eloRating + fight.fighter2.eloRating)) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <p className="text-center text-xs text-zinc-400 leading-relaxed max-w-xl mx-auto">
                      Elo rating captures recent form, quality of opposition, and performance dynamics. 
                      {Math.abs(fight.fighter1.eloRating - fight.fighter2.eloRating) > 50 ? (
                        <span> **{fight.fighter1.eloRating > fight.fighter2.eloRating ? fight.fighter1.name : fight.fighter2.name}** holds a significant rating edge (+{Math.abs(fight.fighter1.eloRating - fight.fighter2.eloRating)} Elo).</span>
                      ) : (
                        <span> Both fighters are rated extremely closely, suggesting a highly competitive and stylistically balanced bout.</span>
                      )}
                    </p>
                  </div>
                )}

                {/* Tab 3: Performance & Physical Stats */}
                {activeTab === "performance" && (
                  <div className="bg-zinc-950/80 rounded-xl border border-zinc-850 overflow-hidden">
                    <div className="grid grid-cols-[1fr,auto,1fr] gap-4 p-4 border-b border-zinc-850 bg-zinc-950/50 text-xs font-bold uppercase tracking-wider text-zinc-400">
                      <div>{fight.fighter1.name}</div>
                      <div className="w-24 text-center">Attribute</div>
                      <div className="text-right">{fight.fighter2.name}</div>
                    </div>
                    <div className="p-4 space-y-4 text-sm font-semibold">
                      {[
                        { label: "Age", val1: fight.fighter1.age, val2: fight.fighter2.age, suffix: "", invert: true },
                        { label: "Height", val1: fight.fighter1.height, val2: fight.fighter2.height, suffix: '"', invert: false },
                        { label: "Reach", val1: fight.fighter1.reach, val2: fight.fighter2.reach, suffix: '"', invert: false },
                        { label: "Wins", val1: fight.fighter1.wins, val2: fight.fighter2.wins, suffix: "", invert: false },
                        { label: "Losses", val1: fight.fighter1.losses, val2: fight.fighter2.losses, suffix: "", invert: true }
                      ].map((item, index) => {
                        const hasVal = item.val1 !== null && item.val2 !== null;
                        const isF1Adv = hasVal && (item.invert ? item.val1! < item.val2! : item.val1! > item.val2!);
                        const isF2Adv = hasVal && (item.invert ? item.val2! < item.val1! : item.val2! > item.val1!);

                        return (
                          <div key={index} className="grid grid-cols-[1fr,auto,1fr] gap-4 py-2 border-b border-zinc-900/60 last:border-0">
                            <div className={`${isF1Adv ? "text-emerald-400 font-bold" : "text-zinc-400 font-mono"}`}>
                              {item.val1 !== null ? `${item.val1}${item.suffix}` : 'N/A'}
                            </div>
                            <div className="text-zinc-500 uppercase tracking-widest text-[10px] w-24 text-center font-bold">
                              {item.label}
                            </div>
                            <div className={`text-right ${isF2Adv ? "text-emerald-400 font-bold" : "text-zinc-400 font-mono"}`}>
                              {item.val2 !== null ? `${item.val2}${item.suffix}` : 'N/A'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Fight Details Footer (Static / Free Tier Info) */}
        <div className="bg-zinc-950/20 py-3 px-6 text-center border-t border-zinc-800/40 text-xs font-bold tracking-wide flex justify-between items-center gap-4 flex-wrap text-zinc-400">
          <div className="flex items-center gap-3">
            {fight.isTitleFight && (
              <Badge variant="default" className="bg-[#CA8A04]/20 text-[#CA8A04] border border-[#CA8A04]/30 font-mono text-[10px] px-2 py-0">
                🏆 Title Bout
              </Badge>
            )}
            <span className="uppercase text-[10px] tracking-widest text-zinc-300">{fight.weightClass || "Catchweight"}</span>
          </div>

          {!isUpcoming && hasResult ? (
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Method: <span className="text-primary uppercase font-black text-[10px] tracking-wider">{fight.method || "N/A"}</span></span>
              {fight.endingRound && (
                <>
                  <span className="font-mono text-zinc-700">|</span>
                  <span className="text-zinc-400">Round: <span className="text-white font-mono">{fight.endingRound}</span></span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase font-black tracking-widest">
              {isExpanded ? "Click to collapse" : "Click row to expand premium stats"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
