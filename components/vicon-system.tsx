"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function ViconSystem() {
  const [expandedIndex, setExpandedIndex] = useState(0)

  const components = [
    {
      title: "Smart Control Unit",
      description: "The system's AI-powered brain coordinating sensors, cameras, and pumps.",
      details:
        "The central processing unit manages all VICON components in real-time, running advanced AI algorithms that analyze sensor data, make split-second decisions, and coordinate the entire suppression sequence. UL & FCC certified for safety and reliability.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WechatIMG413-1NbuHEISX3ViaiAMFKZoYtvleeg2AX.png",
    },
    {
      title: "AI Water Cannon",
      description: "Automatically targets and suppresses fires with adaptive precision.",
      details:
        "Delivers 12 L/s of high-pressure water with unprecedented accuracy. The intelligent nozzle system rotates and adjusts spray patterns based on real-time fire location data, ensuring maximum suppression efficiency while minimizing water waste and property damage.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E6%88%AA%E5%B1%8F2025-06-13-18.16.37-Qoo2vaGfIkOj8ODsDYcAVekpBlXeeu.png",
    },
    {
      title: "Localization Module",
      description: "Determines exact coordinates for targeted spraying.",
      details:
        "Using thermal imaging and multi-spectrum sensors, this module calculates the precise location of the fire threat in 3D space. This data is continuously transmitted to the water cannon to ensure every drop of water goes exactly where it's needed.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WechatIMG413-1NbuHEISX3ViaiAMFKZoYtvleeg2AX.png",
    },
    {
      title: "Water Tank",
      description: "Provides immediate water access — no external supply delay.",
      details:
        "The integrated 13.5 kWh backup battery system ensures your water pumps stay operational even during power outages. Independent water supply means suppression happens instantly without relying on municipal water pressure.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E6%88%AA%E5%B1%8F2025-06-13-18.16.37-Qoo2vaGfIkOj8ODsDYcAVekpBlXeeu.png",
    },
    {
      title: "VICON App",
      description: "Monitor and control your system anywhere, anytime.",
      details:
        "Real-time dashboard shows system status, sensor readings, and live camera feeds. Receive instant alerts for any detected threats, manually control the system if needed, and access historical logs for insurance records and system optimization.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WechatIMG413-1NbuHEISX3ViaiAMFKZoYtvleeg2AX.png",
    },
  ]

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? -1 : index)
  }

  return (
    <section className="py-20 bg-background px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Engineering Built for Safety, Designed for Simplicity
          </h2>
          <p className="text-lg text-muted-foreground mb-2">
            Each VICON unit combines industrial-grade reliability with homeowner ease.
          </p>
          <div className="w-24 h-1 bg-accent mx-auto" />
        </div>

        <div className="space-y-4">
          {components.map((component, index) => (
            <div
              key={index}
              className="border border-primary/20 rounded-lg overflow-hidden bg-primary/5 hover:border-accent/50 transition-colors"
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-primary/10 transition-colors text-left"
              >
                <div>
                  <h3 className="text-xl font-bold text-foreground">{component.title}</h3>
                  <p className="text-muted-foreground text-sm">{component.description}</p>
                </div>
                <ChevronDown
                  size={24}
                  className={`flex-shrink-0 text-primary transition-transform duration-300 ${
                    expandedIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedIndex === index && (
                <div className="px-6 py-6 bg-primary/5 border-t border-primary/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-foreground leading-relaxed mb-4">{component.details}</p>
                    </div>
                    <div>
                      <img
                        src={component.image || "/placeholder.svg"}
                        alt={component.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
