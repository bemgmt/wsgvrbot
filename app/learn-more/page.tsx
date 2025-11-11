import Navigation from "@/components/navigation"
import Environments from "@/components/environments"
import TechnologySection from "@/components/technology-section"
import AppFeatures from "@/components/app-features"
import Testimonials from "@/components/testimonials"
import Footer from "@/components/footer"

export default function LearnMorePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Environments id="environments" />
      <TechnologySection id="technology" />
      <AppFeatures id="app" />
      <Testimonials />
      <Footer />
    </main>
  )
}
