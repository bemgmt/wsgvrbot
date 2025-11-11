"use client"

import Link from "next/link"
import { Zap, Crosshair, Droplets, Smartphone, Sun } from "lucide-react"

export default function WhyVicon() {
  const highlights = [
    { icon: Zap, text: "24/7 AI Monitoring", href: "/learn-more#technology" },
    { icon: Crosshair, text: "Precise Fire Localization", href: "/how-it-works" },
    { icon: Droplets, text: "Automatic High-Pressure Spray", href: "/how-it-works" },
    { icon: Smartphone, text: "Remote App Control & Live Video Feed", href: "/learn-more#app" },
    { icon: Sun, text: "Solar-Powered, Water-Efficient Design", href: "/the-system" },
  ]

  return (
    <section className="py-20 bg-background px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Intelligent Fire Prevention for Modern Living
          </h2>
          <div className="w-24 h-1 bg-accent mx-auto" />
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 md:p-12 mb-16">
          <p className="text-lg text-foreground leading-relaxed">
            <span className="font-bold text-primary">Fires move fast — but VICON moves faster.</span> Our intelligent
            sprinkler system detects smoke and heat within seconds, pinpoints the source, and activates a high-pressure
            water cannon with surgical precision. It's always alert, always learning, and always protecting what matters
            most.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon
            return (
              <Link key={idx} href={item.href} className="flex flex-col items-center text-center group cursor-pointer">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Icon className="text-accent" size={32} />
                </div>
                <p className="font-semibold text-foreground group-hover:text-accent transition-colors">{item.text}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
