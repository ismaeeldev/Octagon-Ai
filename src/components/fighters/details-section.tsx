"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, User, Ruler, TrendingUp, Sparkles, BarChart3 } from "lucide-react";

interface FighterDetails {
  age: number | null;
  height: number | null;
  reach: number | null;
  koWins: number;
  subWins: number;
  wins: number;
  losses: number;
  draws: number;
  eloRating?: number;
}

export function FighterDetailsSection({
  id,
  name,
  initialWins,
  initialLosses,
  initialDraws,
}: {
  id: string;
  name: string;
  initialWins: number;
  initialLosses: number;
  initialDraws: number;
}) {
  const [details, setDetails] = useState<FighterDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"performance" | "elo">("performance");

  useEffect(() => {
    let active = true;
    
    async function loadDetails() {
      try {
        setLoading(true);
        const res = await fetch(`/api/fighters/${id}/details`);
        if (res.ok && active) {
          const data = await res.json();
          setDetails(data);
        }
      } catch (err) {
        console.error("Failed to load fighter live details", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDetails();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex border-b border-zinc-800 gap-6 text-sm font-bold uppercase tracking-wider mb-6">
          <div className="w-28 h-6 bg-muted/20 rounded" />
          <div className="w-24 h-6 bg-muted/20 rounded" />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="h-64 bg-zinc-900/40 border border-zinc-800/60 rounded-xl"></div>
          <div className="h-64 bg-zinc-900/40 border border-zinc-800/60 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const activeDetails = details || {
    age: null,
    height: null,
    reach: null,
    koWins: 0,
    subWins: 0,
    wins: initialWins,
    losses: initialLosses,
    draws: initialDraws,
  };

  const decisionWins = Math.max(0, activeDetails.wins - activeDetails.koWins - activeDetails.subWins);
  const totalFights = activeDetails.wins + activeDetails.losses + activeDetails.draws;
  const winRate = totalFights > 0 ? ((activeDetails.wins / totalFights) * 100).toFixed(1) : "0.0";

  // ELO Rating helper info
  const eloVal = details?.eloRating || 1500;
  let eloTier = "Pro Class";
  let eloColor = "text-zinc-400 border-zinc-800 bg-zinc-900/40";
  let eloDesc = "A competent professional athlete inside the UFC roster.";

  if (eloVal >= 2100) {
    eloTier = "Elite World Class";
    eloColor = "text-yellow-400 border-yellow-500/30 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.15)]";
    eloDesc = "Occupies the uppermost absolute tier of championship contenders and titleholders.";
  } else if (eloVal >= 1950) {
    eloTier = "Division Contender";
    eloColor = "text-primary border-primary/30 bg-primary/5 shadow-[0_0_15px_rgba(210,40,40,0.15)]";
    eloDesc = "A dangerous top-15 ranked standard contender in the division.";
  } else if (eloVal >= 1750) {
    eloTier = "Challenger Class";
    eloColor = "text-blue-400 border-blue-400/30 bg-blue-400/5";
    eloDesc = "An established and rising combatant climbing the rankings ladder.";
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-6 text-sm font-bold uppercase tracking-wider mb-6">
        <button 
          onClick={() => setActiveTab("performance")}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 ${activeTab === "performance" ? "border-primary text-primary" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
        >
          <BarChart3 className="w-4 h-4" /> Performance & Stats
        </button>
        <button 
          onClick={() => setActiveTab("elo")}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 ${activeTab === "elo" ? "border-primary text-primary" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
        >
          <TrendingUp className="w-4 h-4" /> Elo Rankings
        </button>
      </div>

      {activeTab === "performance" && (
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Physical Attributes Card */}
          <Card className="glass-panel overflow-hidden border-white/10 hover:border-primary/20 transition-all duration-300">
            <CardHeader className="bg-muted/10 border-b border-border/30 pb-6 flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-black tracking-tight flex items-center">
                <span className="w-1.5 h-6 bg-primary mr-3 rounded-full shadow-[0_0_10px_rgba(210,40,40,0.6)]"></span>
                Physical Attributes
              </CardTitle>
              <User className="w-5 h-5 text-zinc-500" />
            </CardHeader>
            <CardContent className="p-8">
              <ul className="space-y-6">
                <li className="flex justify-between items-center border-b pb-4 border-border/20">
                  <span className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Age</span>
                  <span className="font-mono text-xl font-bold">{activeDetails.age || "N/A"}</span>
                </li>
                <li className="flex justify-between items-center border-b pb-4 border-border/20">
                  <span className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Height</span>
                  <span className="font-mono text-xl font-bold">
                    {activeDetails.height ? `${activeDetails.height}"` : "N/A"}
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Reach</span>
                  <span className="font-mono text-xl font-bold">
                    {activeDetails.reach ? `${activeDetails.reach}"` : "N/A"}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Method of Victory Card */}
          <Card className="glass-panel overflow-hidden border-white/10 hover:border-primary/20 transition-all duration-300">
            <CardHeader className="bg-muted/10 border-b border-border/30 pb-6 flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-black tracking-tight flex items-center">
                <span className="w-1.5 h-6 bg-primary mr-3 rounded-full shadow-[0_0_10px_rgba(210,40,40,0.6)]"></span>
                Method of Victory
              </CardTitle>
              <Activity className="w-5 h-5 text-zinc-500" />
            </CardHeader>
            <CardContent className="p-8">
              <ul className="space-y-6">
                <li className="flex justify-between items-center border-b pb-4 border-border/20">
                  <span className="text-muted-foreground uppercase tracking-widest text-xs font-bold">KO/TKO</span>
                  <span className="font-mono text-2xl font-black text-primary drop-shadow-[0_0_8px_rgba(210,40,40,0.5)]">
                    {activeDetails.koWins}
                  </span>
                </li>
                <li className="flex justify-between items-center border-b pb-4 border-border/20">
                  <span className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Submission</span>
                  <span className="font-mono text-2xl font-black text-primary drop-shadow-[0_0_8px_rgba(210,40,40,0.5)]">
                    {activeDetails.subWins}
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Decision</span>
                  <span className="font-mono text-2xl font-black text-primary drop-shadow-[0_0_8px_rgba(210,40,40,0.5)]">
                    {decisionWins}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "elo" && (
        <Card className="glass-panel overflow-hidden border-white/10 hover:border-primary/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="bg-muted/10 border-b border-border/30 pb-6 flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-black tracking-tight flex items-center">
              <span className="w-1.5 h-6 bg-primary mr-3 rounded-full shadow-[0_0_10px_rgba(210,40,40,0.6)]"></span>
              Elo Rating Detail & Classification
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-zinc-500" />
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black">Current Rating</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-black text-white font-mono tracking-tighter">{eloVal}</span>
                    <Badge variant="outline" className={`text-xs uppercase tracking-widest font-black font-sans px-3 py-1 rounded-lg border ${eloColor}`}>
                      {eloTier}
                    </Badge>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {eloDesc} The Elo rating adjusts dynamically based on opponents' ratings, victory methods, and performance weights.
                </p>
              </div>

              <div className="bg-zinc-950/40 p-6 rounded-xl border border-zinc-900 space-y-4 shadow-inner">
                <div className="flex justify-between items-center text-xs border-b border-zinc-900 pb-3">
                  <span className="text-zinc-500 uppercase font-bold tracking-wider">Career Win Rate</span>
                  <span className="text-zinc-200 font-bold font-mono text-sm">{winRate}%</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-zinc-900 pb-3">
                  <span className="text-zinc-500 uppercase font-bold tracking-wider">Total Pro Bouts</span>
                  <span className="text-zinc-200 font-bold font-mono text-sm">{totalFights}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 uppercase font-bold tracking-wider">Division Placement</span>
                  <span className="text-zinc-200 font-bold text-sm">Active Roster</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
