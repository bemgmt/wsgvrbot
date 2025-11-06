"use client"

export default function About() {
  return (
    <section className="py-12 md:py-16 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">West San Gabriel Valley REALTORS®</h2>
        <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
          West San Gabriel Valley REALTORS® provides services and resources to over 8,000 licensed real estate
          salespeople and brokers, appraisers, and affiliated service industries throughout the San Gabriel Valley,
          California.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div className="bg-card p-8 rounded-lg border border-border">
            <h3 className="text-xl font-bold mb-4 text-primary">Find a REALTOR®</h3>
            <p className="text-muted-foreground mb-4">
              Looking for a professional real estate agent? Our directory helps you connect with qualified REALTORS® in
              your area.
            </p>
            <button className="text-secondary font-bold hover:text-secondary/80">Search →</button>
          </div>

          <div className="bg-card p-8 rounded-lg border border-border">
            <h3 className="text-xl font-bold mb-4 text-primary">Find an Affiliate</h3>
            <p className="text-muted-foreground mb-4">
              Connect with industry professionals who support the real estate community through services and expertise.
            </p>
            <button className="text-secondary font-bold hover:text-secondary/80">Search →</button>
          </div>
        </div>
      </div>
    </section>
  )
}
