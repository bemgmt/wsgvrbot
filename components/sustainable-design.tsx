import { Leaf, Droplet } from "lucide-react"

export default function SustainableDesign() {
  return (
    <section className="py-20 bg-background px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Smarter. Safer. Greener.</h2>
          <div className="w-24 h-1 bg-accent mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-foreground mb-6 leading-relaxed">
              VICON systems are powered by renewable energy and engineered for water efficiency.
            </p>
            <p className="text-lg text-foreground mb-6 leading-relaxed">
              Solar panels keep your system operational even during outages, while AI ensures every drop of water is
              used with precision — never waste, only protection.
            </p>

            <div className="space-y-4">
              <div className="flex gap-4">
                <Leaf className="text-accent flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-foreground mb-1">Solar-Powered Operation</h3>
                  <p className="text-muted-foreground">
                    Stays operational during power outages with integrated solar panels.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Droplet className="text-accent flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-foreground mb-1">Water-Efficient Design</h3>
                  <p className="text-muted-foreground">AI precision targeting uses only the water needed — no waste.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-12 flex items-center justify-center">
            <div className="text-center">
              <Leaf size={80} className="text-accent mx-auto mb-4" />
              <p className="text-xl font-bold text-foreground">Sustainable Protection</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
