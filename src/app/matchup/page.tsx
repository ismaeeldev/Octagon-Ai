"use client";

import { useEffect, useState } from "react";
import { Swords, Activity, User, Ruler, TrendingUp, HelpCircle, Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FighterBasic {
  id: string;
  name: string;
  weightClass: string | null;
}

interface FighterDetails extends FighterBasic {
  imageUrl: string | null;
  age: number | null;
  height: number | null;
  reach: number | null;
  wins: number;
  losses: number;
  draws: number;
  eloRating: number;
}

interface Prediction {
  winProbabilityFighter1: number;
  winProbabilityFighter2: number;
  confidenceScore: number;
  summary: string;
}

const getWeightLimit = (weightClass: string | null) => {
  if (!weightClass) return "N/A";
  const wc = weightClass.toLowerCase();
  if (wc.includes("heavyweight") && !wc.includes("light")) return "265 lbs";
  if (wc.includes("light heavyweight")) return "205 lbs";
  if (wc.includes("middleweight")) return "185 lbs";
  if (wc.includes("welterweight")) return "170 lbs";
  if (wc.includes("lightweight")) return "155 lbs";
  if (wc.includes("featherweight")) return "145 lbs";
  if (wc.includes("bantamweight")) return "135 lbs";
  if (wc.includes("flyweight")) return "125 lbs";
  if (wc.includes("strawweight")) return "115 lbs";
  return weightClass;
};

export default function MatchupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isPremium = session?.user?.isPremium === true;

  const [fighters, setFighters] = useState<FighterBasic[]>([]);
  const [f1Id, setF1Id] = useState<string>("");
  const [f2Id, setF2Id] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [f1Details, setF1Details] = useState<FighterDetails | null>(null);
  const [f2Details, setF2Details] = useState<FighterDetails | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  useEffect(() => {
    if (status !== "loading" && !isPremium) {
      router.push("/pricing?reason=premium");
    }
  }, [status, isPremium, router]);

  const [img1Loading, setImg1Loading] = useState(true);
  const [img2Loading, setImg2Loading] = useState(true);

  useEffect(() => {
    if (isPremium) {
      fetch("/api/matchup")
        .then(res => res.json())
        .then(data => {
          if (data.fighters) setFighters(data.fighters);
        });
    }
  }, [isPremium]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#18181B] text-zinc-100 flex items-center justify-center">
        <div className="animate-pulse text-zinc-500 font-mono">Verifying authorization credentials...</div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-[#18181B] text-zinc-100 flex items-center justify-center">
        <div className="animate-pulse text-zinc-500 font-mono">Verifying authorization credentials...</div>
      </div>
    );
  }

  const [loadingStep, setLoadingStep] = useState(0);

  const handleCompare = async () => {
    if (!f1Id || !f2Id) return;
    setLoading(true);
    setPrediction(null);
    setLoadingStep(0);
    setImg1Loading(true);
    setImg2Loading(true);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 500);

    try {
      const [res] = await Promise.all([
        fetch("/api/matchup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fighter1Id: f1Id, fighter2Id: f2Id })
        }),
        new Promise(resolve => setTimeout(resolve, 2500))
      ]);
      const data = await res.json();
      clearInterval(stepInterval);
      if (res.ok) {
        setF1Details(data.fighter1);
        setF2Details(data.fighter2);
        setPrediction(data.prediction);
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      clearInterval(stepInterval);
    } finally {
      setLoading(false);
    }
  };

  const getAdvantageClass = (val1: number | null, val2: number | null, invert = false) => {
    if (val1 === null || val2 === null) return "text-zinc-400";
    if (val1 > val2) return invert ? "text-[#D22828]" : "text-green-400";
    if (val1 < val2) return invert ? "text-green-400" : "text-[#D22828]";
    return "text-zinc-400";
  };

  return (
    <div className="min-h-screen bg-[#18181B] text-zinc-100 p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-[#D22828]/10 rounded-full mb-4 border border-[#D22828]/20">
            <Swords className="w-8 h-8 text-[#D22828]" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">Matchup Engine</h1>
          <p className="text-zinc-400 max-w-lg mx-auto">Select two fighters to instantly generate a hypothetical AI prediction based on historical data and physical attributes.</p>
        </div>

        {/* Selectors stacked vertically */}
        <div className="flex flex-col gap-6 mb-12">
          {/* Fighter A Selector Card */}
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Fighter A (Red Corner)</label>
            <select
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl p-4 focus:outline-none focus:border-[#D22828] transition-colors font-semibold"
              value={f1Id}
              onChange={(e) => setF1Id(e.target.value)}
            >
              <option value="">-- Select Fighter --</option>
              {fighters.map(f => <option key={f.id} value={f.id}>{f.name} {f.weightClass ? `(${f.weightClass})` : ''}</option>)}
            </select>
          </div>

          {/* Simulate Action Row */}
          <div className="flex justify-center -my-3 relative z-10">
            <button
              onClick={handleCompare}
              disabled={loading || !f1Id || !f2Id || f1Id === f2Id}
              className="bg-[#D22828] hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-[#D22828] text-white font-black px-12 py-4 rounded-full uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#D22828]/20 border border-zinc-800"
            >
              {loading ? "Analyzing..." : "Predict with AI"}
            </button>
          </div>

          {/* Fighter B Selector Card */}
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Fighter B (Blue Corner)</label>
            <select
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl p-4 focus:outline-none focus:border-blue-500 transition-colors font-semibold"
              value={f2Id}
              onChange={(e) => setF2Id(e.target.value)}
            >
              <option value="">-- Select Fighter --</option>
              {fighters.map(f => <option key={f.id} value={f.id}>{f.name} {f.weightClass ? `(${f.weightClass})` : ''}</option>)}
            </select>
          </div>
        </div>

        {/* AI Simulation Loader */}
        {loading && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 shadow-2xl flex flex-col items-center justify-center min-h-[300px] animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden mb-8">
            {/* Scanner line */}
            <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D22828] to-transparent shadow-[0_0_15px_#D22828] animate-scan pointer-events-none"></div>

            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-[#D22828]/10 border border-[#D22828]/20 mb-6 animate-pulse">
              <Activity className="w-10 h-10 text-[#D22828] animate-[spin_4s_linear_infinite]" />
            </div>

            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">AI Simulation In Progress</h3>

            {/* Rotating statuses */}
            <p className="text-zinc-400 font-mono text-sm h-6 transition-all duration-300">
              {loadingStep === 0 && "Initializing CageMind AI engine..."}
              {loadingStep === 1 && "Synthesizing Elo ratings & skill vectors..."}
              {loadingStep === 2 && "Analyzing physical matchup indices..."}
              {loadingStep === 3 && "Running 10,000 Monte Carlo simulations..."}
              {loadingStep === 4 && "Compiling prediction narrative..."}
            </p>

            {/* Progress bar */}
            <div className="w-64 h-1.5 bg-zinc-950 rounded-full mt-6 overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-[#D22828] transition-all duration-300 ease-out"
                style={{ width: `${(loadingStep + 1) * 20}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && f1Details && f2Details && prediction && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Fighter Face-Off Panel */}
            <div className="relative h-[280px] flex items-center justify-between px-10 overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl mb-8 group">
              {/* Left/Red vs Right/Blue Back Glow */}
              <div className="absolute inset-0 flex pointer-events-none opacity-25 group-hover:opacity-40 transition-opacity duration-700">
                <div className="flex-1 bg-gradient-to-tr from-[#D22828]/25 to-transparent blur-3xl"></div>
                <div className="flex-1 bg-gradient-to-tl from-blue-500/25 to-transparent blur-3xl"></div>
              </div>

              {/* Fighter 1 Image */}
              <div className="w-[42%] flex flex-col items-center justify-end h-full relative z-10 pb-4">
                <div className="relative w-full h-[220px] flex items-end justify-center">
                  <div className="absolute bottom-0 w-28 h-28 bg-[#D22828]/10 rounded-full blur-2xl"></div>
                  {img1Loading && (
                    <div className="absolute inset-0 flex items-end justify-center pb-4">
                      <div className="h-[200px] w-[130px] bg-zinc-800/40 rounded-2xl animate-pulse border border-zinc-750"></div>
                    </div>
                  )}
                  <img
                    src={f1Details.imageUrl || "/fallback_image.png"}
                    alt={f1Details.name}
                    className={`h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] transition-all duration-500 hover:scale-105 select-none ${img1Loading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setImg1Loading(false)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/fallback_image.png';
                      setImg1Loading(false);
                    }}
                  />
                </div>
              </div>

              {/* VS Divider */}
              <div className="relative flex flex-col items-center justify-center z-20">
                <span className="text-sm font-black text-zinc-400 italic bg-zinc-950 border border-zinc-800 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:border-[#D22828]/50 group-hover:text-[#D22828] transition-all duration-300">
                  VS
                </span>
              </div>

              {/* Fighter 2 Image */}
              <div className="w-[42%] flex flex-col items-center justify-end h-full relative z-10 pb-4">
                <div className="relative w-full h-[220px] flex items-end justify-center">
                  <div className="absolute bottom-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl"></div>
                  {img2Loading && (
                    <div className="absolute inset-0 flex items-end justify-center pb-4">
                      <div className="h-[200px] w-[130px] bg-zinc-800/40 rounded-2xl animate-pulse border border-zinc-750"></div>
                    </div>
                  )}
                  <img
                    src={f2Details.imageUrl || "/fallback_image.png"}
                    alt={f2Details.name}
                    className={`h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] transition-all duration-500 hover:scale-105 select-none ${img2Loading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setImg2Loading(false)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/fallback_image.png';
                      setImg2Loading(false);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Probability Bar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 opacity-50"></div>

              <div className="flex justify-between items-end mb-4">
                <div className="text-left">
                  <h2 className="text-3xl font-black text-white uppercase">{f1Details.name}</h2>
                  <p className="text-5xl font-black text-blue-400 mt-2">{prediction.winProbabilityFighter1}%</p>
                </div>
                <div className="text-zinc-500 font-bold uppercase tracking-widest px-4">VS</div>
                <div className="text-right">
                  <h2 className="text-3xl font-black text-white uppercase">{f2Details.name}</h2>
                  <p className="text-5xl font-black text-orange-400 mt-2">{prediction.winProbabilityFighter2}%</p>
                </div>
              </div>

              <div className="w-full h-6 bg-zinc-950 rounded-full flex overflow-hidden border border-zinc-800">
                <div className="h-full bg-blue-500 transition-all duration-1000 ease-out" style={{ width: `${prediction.winProbabilityFighter1}%` }}></div>
                <div className="h-full bg-orange-500 transition-all duration-1000 ease-out" style={{ width: `${prediction.winProbabilityFighter2}%` }}></div>
              </div>

              <div className="mt-8 bg-zinc-950/50 p-6 rounded-xl border border-zinc-800/50 flex items-start gap-4">
                <Activity className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    AI Summary
                    <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-xs">{(prediction.confidenceScore * 100).toFixed(0)}% Confidence</span>
                  </h4>
                  <p className="text-zinc-200 leading-relaxed text-lg">{prediction.summary}</p>
                </div>
              </div>
            </div>

            {/* Stat Matrix */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-[1fr,auto,1fr] gap-4 p-4 border-b border-zinc-800 bg-zinc-950/50">
                <div className="font-bold text-white text-lg">{f1Details.name}</div>
                <div className="text-zinc-500 font-bold uppercase tracking-widest px-4 text-center text-sm mt-1">Attribute</div>
                <div className="font-bold text-white text-lg text-right">{f2Details.name}</div>
              </div>

              <div className="p-4 space-y-2">
                {[
                  { label: "Age", icon: <User className="w-4 h-4" />, v1: f1Details.age, v2: f2Details.age, suffix: "", invert: true },
                  { label: "Height", icon: <Ruler className="w-4 h-4" />, v1: f1Details.height, v2: f2Details.height, suffix: '"', invert: false },
                  { label: "Reach", icon: <Ruler className="w-4 h-4" />, v1: f1Details.reach, v2: f2Details.reach, suffix: '"', invert: false },
                  { label: "Elo Rating", icon: <TrendingUp className="w-4 h-4" />, v1: f1Details.eloRating, v2: f2Details.eloRating, suffix: "", invert: false },
                ].filter(stat => stat.v1 !== null && stat.v2 !== null).map((stat, i) => (
                  <div key={i} className="grid grid-cols-[1fr,auto,1fr] gap-4 py-4 border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors rounded-lg px-4">
                    <div className={`text-xl font-bold ${getAdvantageClass(stat.v1, stat.v2, stat.invert)}`}>
                      {stat.v1 !== null ? `${stat.v1}${stat.suffix}` : 'N/A'}
                    </div>
                    <div className="text-zinc-400 flex items-center justify-center gap-2 font-medium uppercase tracking-wider text-sm w-32">
                      {stat.icon} {stat.label}
                    </div>
                    <div className={`text-xl font-bold text-right ${getAdvantageClass(stat.v2, stat.v1, stat.invert)}`}>
                      {stat.v2 !== null ? `${stat.v2}${stat.suffix}` : 'N/A'}
                    </div>
                  </div>
                ))}

                {/* Weight Class Row */}
                {f1Details.weightClass && f2Details.weightClass && (
                  <div className="grid grid-cols-[1fr,auto,1fr] gap-4 py-4 border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors rounded-lg px-4">
                    <div className="text-xl font-bold text-white">
                      {f1Details.weightClass.replace(/weight/i, "")} ({getWeightLimit(f1Details.weightClass)})
                    </div>
                    <div className="text-zinc-400 flex items-center justify-center gap-2 font-medium uppercase tracking-wider text-sm w-32">
                      <User className="w-4 h-4" /> Weight
                    </div>
                    <div className="text-xl font-bold text-white text-right">
                      {f2Details.weightClass.replace(/weight/i, "")} ({getWeightLimit(f2Details.weightClass)})
                    </div>
                  </div>
                )}

                {/* Record Row (Special Format) */}
                <div className="grid grid-cols-[1fr,auto,1fr] gap-4 py-4 px-4 hover:bg-zinc-800/20 transition-colors rounded-lg">
                  <div className="text-xl font-bold text-white">
                    {f1Details.wins}-{f1Details.losses}-{f1Details.draws}
                  </div>
                  <div className="text-zinc-400 flex items-center justify-center gap-2 font-medium uppercase tracking-wider text-sm w-32">
                    <Swords className="w-4 h-4" /> Record
                  </div>
                  <div className="text-xl font-bold text-white text-right">
                    {f2Details.wins}-{f2Details.losses}-{f2Details.draws}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
