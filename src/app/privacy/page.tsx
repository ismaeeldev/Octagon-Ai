import { Container } from "@/components/layout/container";

export const metadata = {
  title: "Privacy Policy | CageMind AI",
  description: "Privacy Policy for CageMind AI platform.",
};

export default function PrivacyPage() {
  return (
    <Container className="py-20 animate-in fade-in duration-700">
      <div className="max-w-3xl mx-auto space-y-8 glass-panel border border-border/30 p-8 md:p-12 rounded-[2rem] bg-card/60 backdrop-blur-md">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, subscribe to premium features, or communicate with us. This includes your name, email address, and encrypted password data. Payment information is securely handled by our payment processor (Stripe) and is not stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services. This includes securely authenticating your account, processing your premium subscription payments, and sending you technical notices or support messages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information. Your passwords are cryptographically hashed using bcrypt, and all data transfers occur over encrypted HTTPS connections.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">4. Third-Party Services</h2>
            <p>
              We may use third-party services such as analytics providers and payment processors. These services may collect information sent by your browser as part of a web page request, such as cookies or your IP address.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at support@cagemind.ai.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
