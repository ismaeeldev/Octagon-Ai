import Link from "next/link"
import { PremiumLink } from "@/components/ui/premium-link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="flex flex-col w-full pb-20">
      {/* Hero Section */}
      <section className="relative w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background pt-20 pb-24 md:pt-32 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <Container className="relative z-10 flex flex-col items-center text-center">
          <Badge variant="premium" className="mb-8 px-4 py-1.5 text-sm font-semibold tracking-widest uppercase animate-in fade-in slide-in-from-bottom-4 duration-1000">
            SaaS Platform Now Live
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-foreground max-w-4xl mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 fill-mode-both">
            Find Your Betting Edge with AI-Driven <span className="premium-gradient-text">MMA Analytics</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 fill-mode-both">
            CageMind AI provides automated live fight odds, dynamic Elo rankings, and cutting-edge predictive models for the serious fight fan and bettor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500 fill-mode-both">
            <Link href="/events" className="w-full sm:w-auto">
              <Button size="lg" className="text-base px-8 h-14 w-full cursor-pointer rounded-xl">
                View Upcoming Events
              </Button>
            </Link>

            <PremiumLink href="/matchup" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="text-base px-8 h-14 w-full cursor-pointer rounded-xl border-primary/50 bg-primary/15 text-primary hover:bg-primary/15 hover:opacity-80 transition-opacity">
                Explore Matchup Lab
              </Button>
            </PremiumLink>
          </div>
        </Container>
      </section>

      {/* Featured Upcoming Event Section */}
      <section id="events" className="py-20 bg-background">
        <Container>
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Featured Upcoming Event</h2>
            <p className="text-muted-foreground max-w-2xl">
              Get an exclusive look at our predictive data for the next massive pay-per-view.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <Card className="glass-panel overflow-hidden border border-border/30 p-1 rounded-[2rem] shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>
              <div className="bg-card/60 backdrop-blur-md rounded-[1.8rem] overflow-hidden relative z-10">
                <CardHeader className="bg-black/40 border-b border-white/5 pb-8 pt-8">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                        <Badge variant="destructive" className="uppercase font-black tracking-widest bg-red-600 hover:bg-red-600 text-[10px] py-1 px-3 shadow-[0_0_15px_rgba(220,38,38,0.5)] border-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-white mr-2 animate-pulse"></span>Live Odds
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs font-medium text-muted-foreground border-white/10 bg-white/5 backdrop-blur-sm">
                      July 10, 2026 • Las Vegas, NV
                    </Badge>
                  </div>
                  <CardTitle className="text-4xl md:text-5xl font-black uppercase text-center mt-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
                    Makhachev <span className="text-primary/80 mx-2 text-3xl">VS</span> Tsarukyan
                  </CardTitle>
                  <CardDescription className="text-center text-primary/90 font-bold mt-3 tracking-widest uppercase text-sm">
                    UFC 320 - Lightweight Championship
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 divide-white/5 bg-gradient-to-b from-black/20 to-transparent">
                    {/* Fighter 1 */}
                    <div className="p-8 md:p-10 text-center flex flex-col items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <h3 className="font-black text-3xl mb-1 tracking-tight">Islam</h3>
                      <h4 className="font-bold text-xl text-muted-foreground mb-6 uppercase tracking-wider">Makhachev</h4>
                      <Badge variant="outline" className="mb-6 uppercase tracking-widest font-black text-blue-400 border-blue-400/30 bg-blue-400/5">Champion</Badge>

                      <div className="bg-black/40 border border-white/10 w-full py-4 rounded-2xl relative shadow-inner group-hover:border-blue-500/30 transition-colors">
                        <div className="absolute inset-0 bg-blue-500/5 rounded-2xl"></div>
                        <span className="relative font-mono text-4xl font-black text-white">-250</span>
                      </div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mt-4 font-bold">
                        Win Prob: <span className="text-blue-400 text-sm">72%</span>
                      </p>
                    </div>

                    {/* Center Info */}
                    <div className="p-8 text-center flex flex-col items-center justify-center bg-black/40 relative min-h-[200px] border-x border-white/5">
                      <Badge variant="outline" className="mb-auto border-white/10 bg-white/5 uppercase tracking-widest text-[10px]">5 Rounds</Badge>

                      <div className="w-full mt-auto mb-auto space-y-3">
                        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 border border-primary/20 mb-2 shadow-[0_0_20px_rgba(210,40,40,0.15)]">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">AI Edge Unlock</p>
                        <div className="bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 text-white py-3 px-4 rounded-xl text-sm font-black border border-primary/40 shadow-[0_0_20px_rgba(210,40,40,0.3)] backdrop-blur-md">
                          Over 2.5 Rounds
                        </div>
                      </div>
                    </div>

                    {/* Fighter 2 */}
                    <div className="p-8 md:p-10 text-center flex flex-col items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-tl from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <h3 className="font-black text-3xl mb-1 tracking-tight">Arman</h3>
                      <h4 className="font-bold text-xl text-muted-foreground mb-6 uppercase tracking-wider">Tsarukyan</h4>
                      <Badge variant="outline" className="mb-6 uppercase tracking-widest font-black text-red-400 border-red-400/30 bg-red-400/5">Challenger</Badge>

                      <div className="bg-black/40 border border-white/10 w-full py-4 rounded-2xl relative shadow-inner group-hover:border-red-500/30 transition-colors">
                        <div className="absolute inset-0 bg-red-500/5 rounded-2xl"></div>
                        <span className="relative font-mono text-4xl font-black text-white">+190</span>
                      </div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mt-4 font-bold">
                        Win Prob: <span className="text-red-400 text-sm">28%</span>
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-black/60 border-t border-white/5 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-bold text-muted-foreground tracking-wide uppercase">Vegas Odds Syncing</span>
                  </div>
                  <Link href="/pricing" className="w-full md:w-auto">
                    <Button variant="premium" size="lg" className="w-full md:w-auto cursor-pointer rounded-xl font-black tracking-wide shadow-[0_0_20px_rgba(202,138,4,0.3)] hover:shadow-[0_0_30px_rgba(202,138,4,0.5)] transition-shadow">
                      Unlock Full Card Predictions
                    </Button>
                  </Link>
                </CardFooter>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* Features Overview */}
      <section className="py-20 bg-muted/20 border-t border-border">
        <Container>
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Platform Features</h2>
            <p className="text-muted-foreground max-w-2xl">
              Everything you need to analyze the UFC roster. Free tier includes rankings and historical data, while Premium unlocks predictive analytics.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-panel relative overflow-hidden border border-border/30 p-2 rounded-[2rem] shadow-xl hover:shadow-[0_0_40px_rgba(220,38,38,0.15)] hover:-translate-y-2 transition-all duration-500 h-full flex flex-col group/feature">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover/feature:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <div className="bg-card/40 backdrop-blur-md rounded-[1.8rem] h-full flex flex-col relative z-10 p-6">
                <CardHeader className="px-0 pt-0">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20 shadow-inner group-hover/feature:bg-primary group-hover/feature:scale-110 transition-all duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary group-hover/feature:text-white transition-colors duration-500"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight">Elo Rankings DB</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 px-0">
                  <p className="text-muted-foreground leading-relaxed text-sm">Access our comprehensive database of every active UFC fighter, automatically updated with proprietary Elo ratings after every event.</p>
                </CardContent>
                <CardFooter className="px-0 pb-0 mt-6 border-t border-white/5 pt-6">
                  <Link href="/events" className="w-full">
                    <Button variant="outline" className="w-full cursor-pointer rounded-xl h-12 border-primary/20 bg-primary/5 hover:bg-primary text-foreground hover:text-white font-bold transition-all duration-300">
                      Included in Free Tier
                    </Button>
                  </Link>
                </CardFooter>
              </div>
            </Card>

            <Card className="glass-panel relative overflow-hidden border border-premium/30 p-2 rounded-[2rem] shadow-xl hover:shadow-[0_0_40px_rgba(202,138,4,0.2)] hover:-translate-y-2 transition-all duration-500 h-full flex flex-col group/feature">
              <div className="absolute top-0 right-0 z-20">
                <div className="bg-premium text-premium-foreground text-[10px] font-black px-6 py-2 rounded-bl-2xl rounded-tr-[1.8rem] uppercase tracking-widest shadow-[0_0_20px_rgba(202,138,4,0.6)]">Premium Unlock</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-bl from-premium/10 via-transparent to-transparent opacity-50 group-hover/feature:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <div className="bg-card/40 backdrop-blur-md rounded-[1.8rem] h-full flex flex-col relative z-10 p-6">
                <CardHeader className="px-0 pt-0 mt-4">
                  <div className="w-16 h-16 rounded-2xl bg-premium/10 flex items-center justify-center mb-8 border border-premium/20 shadow-inner group-hover/feature:bg-premium group-hover/feature:scale-110 group-hover/feature:-rotate-6 transition-all duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-premium group-hover/feature:text-white transition-colors duration-500"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight text-premium">Matchup Lab</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 px-0">
                  <p className="text-muted-foreground leading-relaxed text-sm">An interactive comparison tool to pit any two fighters against each other. Simulates striking and grappling metrics to find stylistic advantages.</p>
                </CardContent>
                <CardFooter className="px-0 pb-0 mt-6 border-t border-white/5 pt-6">
                  <PremiumLink href="/matchup" className="w-full">
                    <Button variant="premium" className="w-full cursor-pointer rounded-xl h-12 font-black shadow-[0_0_15px_rgba(202,138,4,0.3)] hover:shadow-[0_0_25px_rgba(202,138,4,0.5)] transition-shadow">Unlock Feature</Button>
                  </PremiumLink>
                </CardFooter>
              </div>
            </Card>

            <Card className="glass-panel relative overflow-hidden border border-premium/30 p-2 rounded-[2rem] shadow-xl hover:shadow-[0_0_40px_rgba(202,138,4,0.2)] hover:-translate-y-2 transition-all duration-500 h-full flex flex-col group/feature">
              <div className="absolute top-0 right-0 z-20">
                <div className="bg-premium text-premium-foreground text-[10px] font-black px-6 py-2 rounded-bl-2xl rounded-tr-[1.8rem] uppercase tracking-widest shadow-[0_0_20px_rgba(202,138,4,0.6)]">Premium Unlock</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-premium/10 via-transparent to-transparent opacity-50 group-hover/feature:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <div className="bg-card/40 backdrop-blur-md rounded-[1.8rem] h-full flex flex-col relative z-10 p-6">
                <CardHeader className="px-0 pt-0 mt-4">
                  <div className="w-16 h-16 rounded-2xl bg-premium/10 flex items-center justify-center mb-8 border border-premium/20 shadow-inner group-hover/feature:bg-premium group-hover/feature:scale-110 group-hover/feature:rotate-12 transition-all duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-premium group-hover/feature:text-white transition-colors duration-500"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><line x1="12" y1="18" x2="12" y2="22"></line><line x1="12" y1="2" x2="12" y2="6"></line></svg>
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight text-premium">AI Betting Edge</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 px-0">
                  <p className="text-muted-foreground leading-relaxed text-sm">Full visibility of AI-driven prediction picks across all upcoming fights, directly factoring in FanDuel odds to pinpoint value bets.</p>
                </CardContent>
                <CardFooter className="px-0 pb-0 mt-6 border-t border-white/5 pt-6">
                  <PremiumLink href="/betting" className="w-full">
                    <Button variant="premium" className="w-full cursor-pointer rounded-xl h-12 font-black shadow-[0_0_15px_rgba(202,138,4,0.3)] hover:shadow-[0_0_25px_rgba(202,138,4,0.5)] transition-shadow">Unlock Feature</Button>
                  </PremiumLink>
                </CardFooter>
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  )
}
