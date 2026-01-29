import { HeroCarousel } from "@/components/landing/hero-carousel";
import { FeaturesSection } from "@/components/landing/features-section";
import { FaqSection } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroCarousel />
      <FeaturesSection />
      <FaqSection />
      <LandingFooter />
    </main>
  );
}
