"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function HowItWorks() {
  const [expandedIndex, setExpandedIndex] = useState(0)

  const steps = [
    {
      title: "Detect",
      description: "AI sensors recognize heat, smoke, and flame signatures.",
      details:
        "Our advanced AI vision system constantly monitors your property in real-time, identifying fire threats faster than traditional smoke detectors. Multi-spectrum sensors detect infrared signatures, smoke particles, and flame patterns within seconds.",
    },
    {
      title: "Localize",
      description: "Thermal imaging pinpoints the fire's origin for maximum efficiency.",
      details:
        "Once a threat is detected, our thermal imaging system precisely calculates the fire's exact location, distance, and intensity. This data guides the suppression system to target the flame source with surgical accuracy, minimizing collateral water damage.",
    },
    {
      title: "Suppress",
      description: "The high-pressure cannon activates instantly, extinguishing flames before they spread.",
      details:
        "The VK-240-25-3000's 12 L/s high-pressure water cannon deploys with pinpoint accuracy, concentrating water exactly where the fire is located. The automatic activation means there's no delay waiting for emergency services — protection happens in seconds.",
    },
    {
      title: "Notify",
      description: "You're alerted through the VICON App with live video verification and system status.",
      details:
        "The moment suppression activates, you receive an instant alert on your smartphone with live video feed of the incident, system status, and emergency contact options. You maintain full visibility and control, even from anywhere in the world.",
    },
  ]

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? -1 : index)
  }

  return (
    <section className="py-20 bg-primary text-primary-foreground px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">When Every Second Counts, Intelligence Wins</h2>
          <div className="w-24 h-1 bg-accent mx-auto" />
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="border border-primary-foreground/20 rounded-lg overflow-hidden bg-primary-foreground/5 hover:border-accent/50 transition-colors"
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-primary-foreground/10 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-primary flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-primary-foreground/80 text-sm">{step.description}</p>
                  </div>
                </div>
                <ChevronDown
                  size={24}
                  className={`flex-shrink-0 transition-transform duration-300 ${
                    expandedIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedIndex === index && (
                <div className="px-6 py-4 bg-primary-foreground/5 border-t border-primary-foreground/20">
                  <p className="text-primary-foreground/90 leading-relaxed">{step.details}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
