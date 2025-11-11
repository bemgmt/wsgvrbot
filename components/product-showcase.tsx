"use client"

import { ChevronRight } from "lucide-react"
import { useState } from "react"

export default function ProductShowcase() {
  const [activeCategory, setActiveCategory] = useState(0)

  const categories = [
    {
      title: "VK-240-25-3000 Intelligent Fire Sprinkler",
      description: "AI-enhanced precision fire-suppression system",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WechatIMG413-1NbuHEISX3ViaiAMFKZoYtvleeg2AX.png",
      features: [
        "AI-driven real-time threat detection",
        "Precision water release - minimizes damage",
        "12 L/s high flow rate suppression",
        "Automatic activation on threat detection",
      ],
      specs: "Flow Rate: 12 L/s | Max Head Pressure: 110 m | Power: 3 kW | Voltage: 220V | AI Detection: Real-time",
    },
    {
      title: "Residential Fire Protection",
      description: "Smart fire safety for Southern California homes",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E6%88%AA%E5%B1%8F2025-06-13-18.16.37-Qoo2vaGfIkOj8ODsDYcAVekpBlXeeu.png",
      features: [
        "Continuous AI monitoring for heat and smoke",
        "Mobile app alerts and control",
        "Wildfire-ready protection system",
        "Professional installation and support",
      ],
      specs: "UL & FCC Certified | 24/7 monitoring | 10-year durability | Emergency override",
    },
    {
      title: "Commercial Fire Systems",
      description: "Enterprise-grade fire suppression for businesses",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WechatIMG413-1NbuHEISX3ViaiAMFKZoYtvleeg2AX.png",
      features: [
        "Multi-zone AI monitoring",
        "Advanced detection dashboard",
        "Integrated building management",
        "Professional 24/7 support",
      ],
      specs: "Enterprise-grade | 24/7 monitoring | Custom configurations | SLA guaranteed",
    },
    {
      title: "Backup Home Battery System",
      description: "Power continuity for safety systems during outages",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E6%88%AA%E5%B1%8F2025-06-13-18.16.37-Qoo2vaGfIkOj8ODsDYcAVekpBlXeeu.png",
      features: [
        "Keeps fire systems operational",
        "Powers essential home equipment",
        "Long-duration backup capacity",
        "Seamless integration with VICON",
      ],
      specs: "Capacity: 13.5 kWh | Continuous power support | UPS-grade reliability",
    },
  ]

  return (
    <section className="py-20 bg-background px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">VICON Fire Protection Solutions</h2>
          <div className="w-24 h-1 bg-accent mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setActiveCategory(index)}
              className={`relative group overflow-hidden rounded-lg transition-all ${
                index === activeCategory ? "ring-2 ring-accent scale-105" : "hover:shadow-xl"
              }`}
            >
              <img
                src={category.image || "/placeholder.svg"}
                alt={category.title}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-end">
                <div className="p-4 text-white w-full">
                  <h3 className="font-bold text-lg text-left">{category.title}</h3>
                  <p className="text-sm text-white/80 text-left">{category.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src={categories[activeCategory].image || "/placeholder.svg"}
              alt={categories[activeCategory].title}
              className="w-full rounded-lg shadow-2xl"
            />
          </div>

          <div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">{categories[activeCategory].title}</h3>
            <p className="text-lg text-muted-foreground mb-6">{categories[activeCategory].description}</p>

            <ul className="space-y-4 mb-8">
              {categories[activeCategory].features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="bg-muted p-4 rounded-lg mb-8">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Specifications: </span>
                {categories[activeCategory].specs}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
                Learn More
                <ChevronRight size={20} />
              </button>
              <button className="border-2 border-primary text-primary hover:bg-primary/5 px-8 py-3 rounded-lg font-bold transition-colors">
                Request Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
