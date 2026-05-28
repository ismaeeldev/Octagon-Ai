import { Container } from "@/components/layout/container";

export const metadata = {
  title: "Cookie Policy | CageMind AI",
  description: "Cookie Policy for CageMind AI platform.",
};

export default function CookiesPage() {
  return (
    <Container className="py-20 animate-in fade-in duration-700">
      <div className="max-w-3xl mx-auto space-y-8 glass-panel border border-border/30 p-8 md:p-12 rounded-[2rem] bg-card/60 backdrop-blur-md">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">
            Cookie Policy
          </h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">1. What Are Cookies</h2>
            <p>
              Cookies are small pieces of text sent to your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">2. How CageMind AI Uses Cookies</h2>
            <p>
              When you use and access our platform, we may place cookie files in your web browser. We use cookies for the following purposes:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Authentication:</strong> To securely log you into your account and keep you logged in.</li>
              <li><strong>Preferences:</strong> To remember your site preferences (e.g., dark mode settings).</li>
              <li><strong>Analytics:</strong> To track information about how the Service is used so that we can make improvements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">3. Third-Party Cookies</h2>
            <p>
              In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the Service, such as Google Analytics, and authenticate users securely using providers like NextAuth.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">4. What Are Your Choices Regarding Cookies</h2>
            <p>
              If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, and some of our pages might not display properly.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
