import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import WhyVicon from "@/components/why-vicon"
import PricingSection from "@/components/pricing-section"
import FinalCTA from "@/components/final-cta"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <WhyVicon />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </main>
  )
}
