export const dynamic = "force-dynamic";
import { LandingHeader } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero"
import { FeaturesSection } from "@/components/landing/features"
import { BenefitsSection } from "@/components/landing/benefits"
import { TestimonialsSection } from "@/components/landing/testimonials"
import { PricingTeaser } from "@/components/landing/pricing-teaser"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <TestimonialsSection />
        <PricingTeaser />
      </main>
      <Footer />
    </div>
  )
}
