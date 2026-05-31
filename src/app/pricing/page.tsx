import { Container } from "@/components/layout/container";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubscribeButton } from "@/components/stripe/subscribe-button";
import { Check } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PricingToastHandler } from "@/components/pricing-toast-handler";

export default async function PricingPage() {
  const session = await getServerSession(authOptions);
  
  let isPremium = false;
  if (session?.user?.id) {
    const sub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
    isPremium = sub?.status === "active" && sub.currentPeriodEnd !== null && sub.currentPeriodEnd.getTime() > Date.now();
  }

  return (
    <Container className="py-20 animate-in fade-in duration-700">
      <PricingToastHandler />
      <div className="text-center mb-16 animate-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
        <Badge variant="premium" className="mb-4">CageMind AI Premium</Badge>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 drop-shadow-sm">
          Unlock Your Edge
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get exclusive access to AI-driven predictive models, dynamic Matchup Lab simulations, and real-time betting analytics.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
        {/* Free Tier */}
        <Card className="glass-panel border-border/50 relative overflow-hidden flex flex-col">
          <CardHeader className="bg-muted/10 pb-8">
            <CardTitle className="text-2xl font-black uppercase tracking-tight">Free Tier</CardTitle>
            <CardDescription className="text-base mt-2">Basic access for casual fans.</CardDescription>
            <div className="mt-6 font-mono text-4xl font-black">$0<span className="text-lg text-muted-foreground font-sans font-medium">/mo</span></div>
          </CardHeader>
          <CardContent className="pt-8 flex-1">
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Check className="text-muted-foreground w-5 h-5" />
                <span>View Upcoming & Past Events</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-muted-foreground w-5 h-5" />
                <span>Access Fighter Directory</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-muted-foreground w-5 h-5" />
                <span>View Basic Elo Ratings</span>
              </li>
              <li className="flex items-center gap-3 opacity-30">
                <Check className="text-muted-foreground w-5 h-5" />
                <span className="line-through">AI Prediction Picks</span>
              </li>
              <li className="flex items-center gap-3 opacity-30">
                <Check className="text-muted-foreground w-5 h-5" />
                <span className="line-through">Live Betting Analytics</span>
              </li>
              <li className="flex items-center gap-3 opacity-30">
                <Check className="text-muted-foreground w-5 h-5" />
                <span className="line-through">Matchup Lab Simulator</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="bg-muted/5 border-t border-border/20 pt-6">
            <div className="w-full text-center text-sm font-bold text-muted-foreground uppercase tracking-widest py-3">
              Included by default
            </div>
          </CardFooter>
        </Card>

        {/* Premium Tier */}
        <Card className="glass-panel border-premium/50 relative overflow-hidden flex flex-col shadow-[0_0_30px_rgba(202,138,4,0.1)] hover:shadow-[0_0_40px_rgba(202,138,4,0.2)] transition-shadow duration-500 scale-105">
          <div className="absolute top-0 right-0 bg-premium text-premium-foreground text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest shadow-[0_0_10px_rgba(202,138,4,0.5)] z-10">Most Popular</div>
          <div className="absolute inset-0 bg-gradient-to-br from-premium/5 via-transparent to-transparent pointer-events-none"></div>
          
          <CardHeader className="bg-muted/10 pb-8 relative z-10">
            <CardTitle className="text-2xl font-black uppercase tracking-tight text-premium">Premium</CardTitle>
            <CardDescription className="text-base mt-2">The ultimate toolkit for serious bettors.</CardDescription>
            <div className="mt-6 font-mono text-4xl font-black text-foreground">$24.99<span className="text-lg text-muted-foreground font-sans font-medium">/mo</span></div>
          </CardHeader>
          <CardContent className="pt-8 flex-1 relative z-10">
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Check className="text-premium w-5 h-5 drop-shadow-[0_0_5px_rgba(202,138,4,0.5)]" />
                <span className="font-semibold">Everything in Free</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-premium w-5 h-5 drop-shadow-[0_0_5px_rgba(202,138,4,0.5)]" />
                <span className="font-semibold text-foreground">AI Prediction Picks & Confidence</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-premium w-5 h-5 drop-shadow-[0_0_5px_rgba(202,138,4,0.5)]" />
                <span className="font-semibold text-foreground">Live Betting Analytics Tab</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-premium w-5 h-5 drop-shadow-[0_0_5px_rgba(202,138,4,0.5)]" />
                <span className="font-semibold text-foreground">Full Matchup Lab Access</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-premium w-5 h-5 drop-shadow-[0_0_5px_rgba(202,138,4,0.5)]" />
                <span className="font-semibold text-foreground">Priority Support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="bg-muted/5 border-t border-border/20 pt-6 relative z-10">
            {isPremium ? (
              <div className="w-full text-center text-sm font-bold text-premium uppercase tracking-widest py-3 border border-premium/30 rounded-lg bg-premium/10">
                You are Premium
              </div>
            ) : (
              <SubscribeButton />
            )}
          </CardFooter>
        </Card>
      </div>
    </Container>
  );
}
