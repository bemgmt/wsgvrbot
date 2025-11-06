"use client"

export default function CTASection() {
  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-r from-primary to-primary/90 text-white overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "url(/placeholder.svg?height=400&width=1200&query=real%20estate%20background%20pattern)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Professional Development & Training</h2>
        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          Stay current with industry standards, regulations, and best practices through our comprehensive education
          programs.
        </p>
        <button className="bg-secondary hover:bg-secondary/90 text-black font-bold py-3 px-8 rounded-lg text-lg transition-colors">
          Learn More →
        </button>
      </div>
    </section>
  )
}
