"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Lock, ChevronLeft, ChevronRight, Activity, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Fight {
  id: string;
  weightClass: string | null;
  aiPrediction: string | null;
  aiConfidence: number | null;
  fighter1: { name: string; imageUrl?: string | null };
  fighter2: { name: string; imageUrl?: string | null };
  event: { name: string; date: string };
}

const WEIGHT_CLASSES = [
  "Flyweight", "Bantamweight", "Featherweight", "Lightweight",
  "Welterweight", "Middleweight", "Light Heavyweight", "Heavyweight",
  "Women's Strawweight", "Women's Flyweight", "Women's Bantamweight"
];

const MOCK_PREDICTIONS: Fight[] = [
  {
    id: "mock-fight-1",
    weightClass: "Light Heavyweight Bout",
    aiPrediction: "Alex Pereira is favored to win with a 58.4% probability. This prediction is primarily driven by a significant Elo advantage (+84 points), and notable physical advantages for Alex Pereira.",
    aiConfidence: 0.72,
    fighter1: { name: "Alex Pereira", imageUrl: null },
    fighter2: { name: "Jamahal Hill", imageUrl: null },
    event: { name: "UFC 300: Pereira vs. Hill", date: "2026-04-13T22:00:00.000Z" }
  },
  {
    id: "mock-fight-2",
    weightClass: "Women's Strawweight Title Bout",
    aiPrediction: "Zhang Weili is favored to win with a 65.2% probability. This prediction is primarily driven by stronger recent momentum by Zhang Weili, and higher career win percentage.",
    aiConfidence: 0.81,
    fighter1: { name: "Zhang Weili", imageUrl: null },
    fighter2: { name: "Yan Xiaonan", imageUrl: null },
    event: { name: "UFC 300: Pereira vs. Hill", date: "2026-04-13T22:00:00.000Z" }
  },
  {
    id: "mock-fight-3",
    weightClass: "Lightweight Bout",
    aiPrediction: "Max Holloway is favored to win with a 52.1% probability. The metrics are incredibly close across the board, making this a highly competitive matchup.",
    aiConfidence: 0.58,
    fighter1: { name: "Justin Gaethje", imageUrl: null },
    fighter2: { name: "Max Holloway", imageUrl: null },
    event: { name: "UFC 300: Pereira vs. Hill", date: "2026-04-13T22:00:00.000Z" }
  }
];

function FighterAvatar({ src, name }: { src?: string | null; name: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const displayName = name || "Fighter";
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="relative w-20 h-20 bg-zinc-950/80 rounded-full border border-zinc-800/80 flex items-center justify-center overflow-hidden mb-2 group-hover:border-[#D22828]/40 transition-colors duration-300">
      {!loaded && !error && (
        <div className="absolute inset-0 bg-zinc-800/40 rounded-full animate-pulse border border-zinc-750"></div>
      )}
      {src && src !== "null" && src !== "undefined" && !error ? (
        <img
          src={src}
          alt={displayName}
          className={`h-full w-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-500 font-black tracking-tighter uppercase text-lg select-none">
          {initials}
        </div>
      )}
    </div>
  );
}

const cleanWeightClass = (wc: string | null): string => {
  if (!wc) return "Catchweight";
  return wc
    .replace(/(?:#[0-9]+|C)\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim() || "Catchweight";
};

export default function PredictionsDashboard() {
  const router = useRouter();
  const [fights, setFights] = useState<Fight[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  const [search, setSearch] = useState("");
  const [weightClass, setWeightClass] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (!loading && !isPremium) {
      router.push("/pricing?reason=premium");
    }
  }, [loading, isPremium, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchPredictions();
  }, [debouncedSearch, weightClass, page]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        search: debouncedSearch,
        weightClass: weightClass
      });
      const res = await fetch(`/api/predictions?${params}`);
      if (res.ok) {
        const data = await res.json();
        let fightsData = data.fights || [];
        if (fightsData.length === 0) {
          let filteredMock = [...MOCK_PREDICTIONS];
          if (debouncedSearch) {
            filteredMock = filteredMock.filter(f =>
              f.fighter1.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              f.fighter2.name.toLowerCase().includes(debouncedSearch.toLowerCase())
            );
          }
          if (weightClass) {
            filteredMock = filteredMock.filter(f =>
              f.weightClass?.toLowerCase().includes(weightClass.toLowerCase())
            );
          }
          fightsData = filteredMock;
        }
        setFights(fightsData);
        setTotalPages(data.totalPages || 1);
        setIsPremium(data.isPremium);
      } else if (res.status === 403) {
        setFights([]);
        setTotalPages(1);
        setIsPremium(false);
      } else {
        let filteredMock = [...MOCK_PREDICTIONS];
        if (debouncedSearch) {
          filteredMock = filteredMock.filter(f =>
            f.fighter1.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            f.fighter2.name.toLowerCase().includes(debouncedSearch.toLowerCase())
          );
        }
        if (weightClass) {
          filteredMock = filteredMock.filter(f =>
            f.weightClass?.toLowerCase().includes(weightClass.toLowerCase())
          );
        }
        setFights(filteredMock);
        setTotalPages(1);
        setIsPremium(false);
      }
    } catch (e) {
      console.error(e);
      let filteredMock = [...MOCK_PREDICTIONS];
      if (debouncedSearch) {
        filteredMock = filteredMock.filter(f =>
          f.fighter1.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          f.fighter2.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      }
      if (weightClass) {
        filteredMock = filteredMock.filter(f =>
          f.weightClass?.toLowerCase().includes(weightClass.toLowerCase())
        );
      }
      setFights(filteredMock);
      setTotalPages(1);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  };

  const extractProbabilities = (summary: string, f1Name: string): { f1Prob: number, f2Prob: number } | null => {
    const match = summary.match(/(\d+\.\d+)%/);
    if (!match) return null;
    const prob = parseFloat(match[1]);

    if (summary.includes(`${f1Name} is favored`)) {
      return { f1Prob: prob, f2Prob: 100 - prob };
    } else {
      return { f1Prob: 100 - prob, f2Prob: prob };
    }
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-[#18181B] text-zinc-100 flex items-center justify-center">
        <div className="animate-pulse text-zinc-500 font-mono">Verifying authorization credentials...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18181B] text-zinc-100 p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-3">
            <Activity className="w-8 h-8 text-[#D22828]" /> AI Predictions
          </h1>
          <p className="text-zinc-400">Unlock mathematically precise fight predictions powered by our proprietary heuristic engine.</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search fighters..."
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-[#D22828] transition-colors"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <select
              className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg py-3 pl-12 pr-4 appearance-none focus:outline-none focus:border-[#D22828] transition-colors"
              value={weightClass}
              onChange={(e) => { setWeightClass(e.target.value); setPage(1); }}
            >
              <option value="">All Weights</option>
              {WEIGHT_CLASSES.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>

        {/* List */}
        <div className="space-y-6">
          {loading ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 shadow-2xl flex flex-col items-center justify-center min-h-[350px] animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden mb-8">
              {/* Scanning laser line */}
              <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D22828] to-transparent shadow-[0_0_15px_#D22828] animate-scan pointer-events-none"></div>

              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-[#D22828]/10 border border-[#D22828]/20 mb-6 animate-pulse">
                <Activity className="w-10 h-10 text-[#D22828] animate-[spin_4s_linear_infinite]" />
              </div>

              <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Analyzing Fight Matrix</h3>

              {/* Rotating statuses */}
              <p className="text-zinc-400 font-mono text-sm h-6 transition-all duration-300">
                {loadingStep === 0 && "Accessing CageMind AI neural database..."}
                {loadingStep === 1 && "Synthesizing ELO parameters & weight class ratings..."}
                {loadingStep === 2 && "Evaluating reach, height, and age differentials..."}
                {loadingStep === 3 && "Running Monte Carlo simulations on fighter records..."}
                {loadingStep === 4 && "Finalizing prediction narrative output..."}
              </p>

              {/* Progress bar */}
              <div className="w-64 h-1.5 bg-zinc-950 rounded-full mt-6 overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-[#D22828] transition-all duration-300 ease-out"
                  style={{ width: `${(loadingStep + 1) * 20}%` }}
                ></div>
              </div>
            </div>
          ) : fights.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
              <p className="text-zinc-400">No predictions found.</p>
            </div>
          ) : (
            fights.map((fight) => {
              const isLocked = !isPremium || fight.aiPrediction === "LOCKED_PREMIUM";
              const probs = !isLocked && fight.aiPrediction ? extractProbabilities(fight.aiPrediction, fight.fighter1.name) : null;

              return (
                <div key={fight.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">

                  {/* Top Bar */}
                  <div className="flex justify-between items-center mb-6 text-sm">
                    <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full font-medium tracking-wide">
                      {cleanWeightClass(fight.weightClass)}
                    </span>
                    <span className="text-zinc-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {new Date(fight.event.date).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Fighters Header with Images */}
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex flex-col items-center w-[40%] text-center">
                      <FighterAvatar src={fight.fighter1.imageUrl} name={fight.fighter1.name} />
                      <h2 className="text-xl font-black text-white uppercase truncate max-w-full">{fight.fighter1.name}</h2>
                    </div>

                    <div className="text-zinc-500 font-bold uppercase tracking-widest px-4 text-sm italic border border-zinc-800 bg-zinc-950 px-3 py-1.5 rounded-full shadow-lg">VS</div>

                    <div className="flex flex-col items-center w-[40%] text-center">
                      <FighterAvatar src={fight.fighter2.imageUrl} name={fight.fighter2.name} />
                      <h2 className="text-xl font-black text-white uppercase truncate max-w-full">{fight.fighter2.name}</h2>
                    </div>
                  </div>

                  {/* Prediction Area */}
                  <div className="relative">
                    {isLocked ? (
                      // Locked State
                      <div className="relative h-32 rounded-xl overflow-hidden bg-zinc-950/50 border border-zinc-800/50">
                        {/* Fake blurred content */}
                        <div className="absolute inset-0 flex flex-col justify-center px-8 blur-md opacity-30 select-none pointer-events-none">
                          <div className="w-full h-4 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full mb-4"></div>
                          <div className="h-2 w-3/4 bg-zinc-400 rounded mb-2"></div>
                          <div className="h-2 w-1/2 bg-zinc-400 rounded"></div>
                        </div>

                        {/* Lock Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20 backdrop-blur-sm">
                          <Lock className="w-8 h-8 text-[#D22828] mb-3 drop-shadow-lg" />
                          <h3 className="text-white font-bold tracking-wider mb-2 drop-shadow-md text-lg">Premium Prediction</h3>
                          <Link href="/pricing" className="bg-[#D22828] hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold uppercase tracking-wide text-sm transition-all hover:scale-105 shadow-lg shadow-red-500/20">
                            Unlock Now
                          </Link>
                        </div>
                      </div>
                    ) : (
                      // Premium Unlocked State
                      <div className="bg-zinc-950/80 rounded-xl p-6 border border-zinc-800/50">
                        {probs && (
                          <div className="mb-6">
                            <div className="flex justify-between text-xl font-black mb-2">
                              <span className="text-blue-400">{probs.f1Prob.toFixed(1)}%</span>
                              <span className="text-orange-400">{probs.f2Prob.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-3 bg-zinc-900 rounded-full flex overflow-hidden border border-zinc-800">
                              <div className="h-full bg-blue-500" style={{ width: `${probs.f1Prob}%` }}></div>
                              <div className="h-full bg-orange-500" style={{ width: `${probs.f2Prob}%` }}></div>
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-4">
                          <Activity className="w-5 h-5 text-purple-400 shrink-0 mt-1" />
                          <div>
                            <div className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                              AI Summary
                              {fight.aiConfidence && (
                                <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-[10px]">
                                  {(fight.aiConfidence * 100).toFixed(0)}% Confidence
                                </span>
                              )}
                            </div>
                            <p className="text-zinc-200 leading-relaxed text-sm">{fight.aiPrediction}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 mt-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="font-bold text-zinc-400">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
