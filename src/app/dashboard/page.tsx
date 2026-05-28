import { Container } from "@/components/layout/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ManageBillingButton } from "@/components/stripe/manage-billing-button";
import { ChangePasswordDialog } from "@/components/auth/change-password-dialog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  const isPremium = 
    subscription?.status === "active" && 
    subscription.currentPeriodEnd && 
    subscription.currentPeriodEnd.getTime() > Date.now();

  const isCanceled = subscription?.status === "canceled";

  return (
    <div className="w-full pb-20 bg-[#18181B]">
      {/* Hero Section */}
      <section className="relative w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pt-16 pb-12 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        <Container className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">Account </span>
                <span className="text-premium">Settings</span>
              </h1>
              <p className="text-muted-foreground text-lg">Manage your profile, security credentials, and subscription status.</p>
            </div>
            <div className="flex items-center gap-4">
              {isPremium ? (
                <Badge variant="premium" className="px-4 py-1.5 shadow-lg">
                  Premium Active
                </Badge>
              ) : (
                <Link href="/pricing">
                  <Button variant="premium" className="px-4 py-1.5 shadow-[0_0_15px_-3px_rgba(202,138,4,0.5)]">
                    Upgrade to Premium
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-12 animate-in fade-in duration-700 delay-150">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Account Profile Card */}
          <Card className="glass-panel border-border/50 relative overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/30 pb-6">
              <CardTitle className="text-2xl font-black tracking-tight">Account Profile</CardTitle>
              <CardDescription>Your personal credentials and password security settings.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Name</p>
                    <p className="text-lg font-bold text-white">{session.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Email Address</p>
                    <p className="text-lg font-bold text-white">{session.user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <ChangePasswordDialog />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription / Plan Card */}
          <Card className="glass-panel border-border/50 relative overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/30 pb-6">
              <CardTitle className="text-2xl font-black tracking-tight">Billing &amp; Subscription</CardTitle>
              <CardDescription>View, upgrade, or manage your membership billing details.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white">
                    {isPremium ? "CageMind AI Premium" : "Free Tier"}
                  </h3>
                  
                  {isPremium ? (
                    <div className="flex items-center gap-3 mt-4">
                      <Badge variant="premium" className="px-3 py-1 text-xs shadow-none">Active</Badge>
                      <span className="text-sm text-muted-foreground">
                        Renews on {subscription?.currentPeriodEnd && new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(subscription.currentPeriodEnd)}
                      </span>
                    </div>
                  ) : isCanceled ? (
                    <div className="flex items-center gap-3 mt-4">
                      <Badge variant="destructive" className="px-3 py-1 text-xs shadow-none">Canceled</Badge>
                      <span className="text-sm text-muted-foreground">
                        Your subscription has been canceled.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mt-4">
                      <Badge variant="outline" className="px-3 py-1 text-xs shadow-none bg-muted/50 border-border/50 text-zinc-300">Free</Badge>
                      <span className="text-sm text-muted-foreground">
                        You are currently on the free tier. Access AI features by upgrading.
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  {subscription?.stripeCustomerId ? (
                    <ManageBillingButton />
                  ) : (
                    <Button asChild variant="premium" className="w-full">
                      <Link href="/pricing">Upgrade to Premium</Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </Container>
    </div>
  );
}
