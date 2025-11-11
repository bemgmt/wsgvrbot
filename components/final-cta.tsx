export default function FinalCTA() {
  return (
    <section className="py-20 bg-primary text-primary-foreground px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Protect What Matters Most?</h2>
        <p className="text-lg mb-12 text-primary-foreground/90">
          Join thousands of homeowners taking a smarter step toward fire safety.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-4 rounded-lg font-bold text-lg transition-colors">
            Request a Demo
          </button>
          <button className="border-2 border-accent text-accent hover:bg-accent/10 px-10 py-4 rounded-lg font-bold text-lg transition-colors">
            Protect My Home
          </button>
        </div>

        <p className="text-2xl font-bold mt-12 text-accent">Your Home's Guardian.</p>
      </div>
    </section>
  )
}
