import Link from "next/link"
import { PremiumLink } from "@/components/ui/premium-link"
import { Container } from "./container"

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center space-x-2 group mb-4">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-premium/10 border border-premium/30 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-premium">
                  <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                </svg>
              </div>
              <span className="inline-flex items-center font-black text-xl tracking-wide uppercase">
                <span className="text-foreground">CageMind</span>
                <span className="text-premium ml-1">AI</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              The premier UFC & MMA Analytics Platform. Leverage automated data, live fight odds, and AI-driven prediction models to find your betting edge.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/fighters" className="hover:text-foreground transition-colors cursor-pointer">
                  Elo Rankings
                </Link>
              </li>
              <li>
                <Link href="/predictions" className="hover:text-foreground transition-colors cursor-pointer">
                  Prediction Models
                </Link>
              </li>
              <li>
                <PremiumLink href="/betting" className="hover:text-foreground transition-colors cursor-pointer">
                  Betting Edge
                </PremiumLink>
              </li>
              <li>
                <PremiumLink href="/matchup" className="hover:text-foreground transition-colors cursor-pointer">
                  Matchup Lab
                </PremiumLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CageMind AI. All rights reserved.</p>
          <p>
            Data sources: roster.watch, Tapology, ESPN, UFC, FanDuel.
          </p>
        </div>
      </Container>
    </footer>
  )
}
