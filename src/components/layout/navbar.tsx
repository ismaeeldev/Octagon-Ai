"use client";

import { PremiumLink } from "@/components/ui/premium-link"
import Link from "next/link"
import { Container } from "./container"
import { Button } from "@/components/ui/button"
import { AuthNav } from "@/components/auth-nav"
import { useSession } from "next-auth/react"

export function Navbar() {
  const { data: session } = useSession();
  const isPremium = session?.user?.isPremium === true;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-16 items-center">
        <div className="flex flex-1 items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-premium/10 border border-premium/30 group-hover:bg-premium/20 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-premium">
                <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
              </svg>
            </div>
            <span className="inline-flex items-center font-black text-xl tracking-wide uppercase">
              <span className="text-foreground">CageMind</span>
              <span className="text-premium ml-1">AI</span>
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex flex-1 justify-center gap-4 lg:gap-6 md:mr-8 lg:mr-20">
          <Link
            href="/events"
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Events
          </Link>
          <Link
            href="/fighters"
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Fighters
          </Link>
          <Link
            href="/predictions"
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Predictions
          </Link>
          <PremiumLink
            href="/matchup"
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer whitespace-nowrap"
          >
            Matchup Lab
          </PremiumLink>
          <Link
            href="/pricing"
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Pricing
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <AuthNav />
            {isPremium ? (
              <Link href="/dashboard">
                <Button variant="premium" className="cursor-pointer">Manage Billing</Button>
              </Link>
            ) : (
              <Link href="/pricing">
                <Button variant="premium" className="cursor-pointer">Subscribe to Premium</Button>
              </Link>
            )}
          </nav>
        </div>
      </Container>
    </header>
  )
}
