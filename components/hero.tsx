"use client"

import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="relative h-96 bg-gradient-to-r from-primary to-primary/80 overflow-hidden">
      {/* Background image overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage:
            "url(/placeholder.svg?height=400&width=1200&query=San%20Gabriel%20Valley%20neighborhood%20aerial%20view)",
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center h-full px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">We are West San Gabriel Valley REALTORS®</h1>
        <p className="text-white/90 text-lg mb-8 max-w-2xl">
          Serving the real estate community and consumers with excellence and integrity
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="bg-secondary hover:bg-secondary/90 text-black font-bold text-lg px-8">Join Today →</Button>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white/20 font-bold text-lg px-8 bg-transparent"
          >
            Pay Your Bill →
          </Button>
        </div>
      </div>
    </section>
  )
}
