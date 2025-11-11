export default function PricingSection() {
  return (
    <section className="py-20 bg-primary text-primary-foreground px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Safety Shouldn't Be a Luxury</h2>
        <div className="w-24 h-1 bg-accent mx-auto mb-8" />

        <p className="text-xl mb-8 leading-relaxed">
          Protect your home for as low as <span className="font-bold text-accent">$200/month</span> with official bank
          financing — no upfront cost required.
        </p>

        <p className="text-lg mb-12 text-primary-foreground/90">
          VICON makes advanced fire protection accessible for every homeowner, developer, and community builder.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="flex items-center gap-3 bg-primary-foreground/10 rounded-lg p-4">
            <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
            <span>Flexible financing options</span>
          </div>
          <div className="flex items-center gap-3 bg-primary-foreground/10 rounded-lg p-4">
            <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
            <span>No installation deposit</span>
          </div>
          <div className="flex items-center gap-3 bg-primary-foreground/10 rounded-lg p-4">
            <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
            <span>Official bank partnership</span>
          </div>
          <div className="flex items-center gap-3 bg-primary-foreground/10 rounded-lg p-4">
            <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
            <span>Increases property value and insurance confidence</span>
          </div>
        </div>

        <button className="bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-4 rounded-lg font-bold text-lg transition-colors">
          Get Your Free Quote Today
        </button>
      </div>
    </section>
  )
}
