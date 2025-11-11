export default function About() {
  const values = [
    {
      number: "1",
      title: "Greener Innovation",
      description:
        "VICON's precision fire-suppression technology minimizes water waste while delivering maximum protection, combining safety engineering with environmental responsibility.",
    },
    {
      number: "2",
      title: "Safer Communities",
      description:
        "Our AI-driven fire-protection systems safeguard Southern California homes and businesses from fire threats, including wildfire conditions, with real-time threat detection and rapid response.",
    },
    {
      number: "3",
      title: "Smarter Solutions",
      description:
        "AI-powered continuous monitoring, mobile app control, and automated activation ensure protection 24/7 with minimal human intervention and proven precision.",
    },
  ]

  return (
    <section className="py-20 bg-primary text-primary-foreground px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose VICON?</h2>
          <div className="w-24 h-1 bg-accent mx-auto" />
        </div>

        <p className="text-center text-lg max-w-3xl mx-auto mb-16 text-primary-foreground/90">
          VICON Intelligent Fire-Protection Systems deliver AI-powered safety for Southern California's homes and
          businesses. Our UL & FCC certified technology combines advanced detection, precision suppression, and proven
          resilience against fire threats.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {values.map((value) => (
            <div key={value.number} className="text-center">
              <div className="text-6xl font-bold text-accent mb-4">{value.number}</div>
              <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
              <p className="text-primary-foreground/80 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-primary-foreground/10 rounded-lg p-12 text-center border border-primary-foreground/20">
          <h3 className="text-3xl font-bold mb-6">Protect What Matters Most</h3>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Schedule a free fire-safety consultation with our VICON experts to discover the perfect protection system
            for your home or business in Southern California.
          </p>
          <button className="bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-4 rounded-lg font-bold text-lg transition-colors">
            Schedule Free Consultation
          </button>
        </div>
      </div>
    </section>
  )
}
