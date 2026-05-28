import { Container } from "@/components/layout/container";

export const metadata = {
  title: "Terms of Service | CageMind AI",
  description: "Terms of Service for CageMind AI platform.",
};

export default function TermsPage() {
  return (
    <Container className="py-20 animate-in fade-in duration-700">
      <div className="max-w-3xl mx-auto space-y-8 glass-panel border border-border/30 p-8 md:p-12 rounded-[2rem] bg-card/60 backdrop-blur-md">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the CageMind AI platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">2. Description of Service</h2>
            <p>
              CageMind AI provides MMA analytics, live odds syncing, and predictive models for informational and entertainment purposes only. We do not guarantee the accuracy of predictions or odds, and we are not a sportsbook or gambling operator.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">3. Premium Subscriptions</h2>
            <p>
              Access to predictive AI models requires a premium subscription. Subscriptions are billed on a recurring basis. You may cancel at any time, and you will retain access until the end of your current billing period. Refunds are subject to our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">4. Disclaimer of Warranties</h2>
            <p>
              The service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, regarding the accuracy, reliability, or completeness of the data or predictions. All betting decisions made using our data are strictly at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">5. Limitation of Liability</h2>
            <p>
              In no event shall CageMind AI, nor its directors, employees, partners, or agents, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
