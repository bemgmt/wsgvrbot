import Navigation from "@/components/navigation"
import ViconSystem from "@/components/vicon-system"
import SustainableDesign from "@/components/sustainable-design"
import Footer from "@/components/footer"

export default function TheSystemPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <ViconSystem />
      <SustainableDesign />
      <Footer />
    </main>
  )
}
