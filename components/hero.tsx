"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function Hero() {
  const [current, setCurrent] = useState(0)

  const slides = [
    {
      title: "Smart Fire Protection — VICON Takes the Lead",
      subtitle:
        "AI-powered detection, precision targeting, and instant response — protecting your home before flames can spread.",
      cta: "Protect Your Home for $200/month",
      image: "/smart-fire-detection-system-with-ai-monitoring.jpg",
    },
    {
      title: "Intelligent Fire Prevention for Modern Living",
      subtitle:
        "Our AI catches threats in seconds and responds with surgical precision — always alert, always learning.",
      cta: "Schedule a Free Consultation",
      image: "/advanced-fire-suppression-system-protecting-home.jpg",
    },
    {
      title: "Safer. Greener. Smarter.",
      subtitle: "Solar-powered, water-efficient protection engineered for every home in Southern California.",
      cta: "Learn How VICON Works",
      image: "/modern-fire-safety-system-in-residential-building.jpg",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const next = () => setCurrent((prev) => (prev + 1) % slides.length)
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden bg-primary">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img src={slide.image || "/placeholder.svg"} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">{slides[current].title}</h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl">{slides[current].subtitle}</p>
        <button className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 rounded-lg font-bold transition-colors">
          {slides[current].cta}
        </button>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors z-10"
        aria-label="Next slide"
      >
        <ChevronRight size={28} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all ${index === current ? "bg-accent w-8" : "bg-white/50"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
