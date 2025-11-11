import { Home, Building2, Factory, Zap } from "lucide-react"

export default function Environments({ id }: { id?: string }) {
  const environments = [
    {
      icon: Home,
      title: "Residential Homes & Villas",
      description: "Complete protection for family properties with app control and 24/7 monitoring.",
    },
    {
      icon: Building2,
      title: "Schools & Campuses",
      description: "Multi-zone coverage designed for educational facilities and student safety.",
    },
    {
      icon: Factory,
      title: "Industrial Facilities",
      description: "Enterprise-grade suppression for high-risk manufacturing and storage areas.",
    },
    {
      icon: Zap,
      title: "Municipal & Urban Projects",
      description: "Scalable systems for community buildings and large-scale developments.",
    },
  ]

  return (
    <section id={id} className="py-20 bg-primary text-primary-foreground px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for Homes, Schools, and Communities</h2>
          <p className="text-lg mb-4">
            From private residences to large developments, VICON adapts to protect any space:
          </p>
          <div className="w-24 h-1 bg-accent mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {environments.map((env, idx) => {
            const Icon = env.icon
            return (
              <div key={idx} className="bg-primary-foreground/10 rounded-lg p-8 border border-primary-foreground/20">
                <Icon className="text-accent mb-4" size={40} />
                <h3 className="text-2xl font-bold mb-2">{env.title}</h3>
                <p className="text-primary-foreground/80">{env.description}</p>
              </div>
            )
          })}
        </div>

        <div className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-lg p-12 text-center">
          <p className="text-2xl font-bold italic">
            "Every home deserves intelligent protection — VICON makes that possible."
          </p>
          <p className="text-primary-foreground/70 mt-4">— Janice, VICON Technologies</p>
        </div>
      </div>
    </section>
  )
}
